const DrillSession = require('../models/drillSessionModel');
const Room = require('../models/roomModel');
const User = require('../models/userModel');
const ClassroomOccupancy = require('../models/occupancyModel');
const { triangulateRSSI, matchRoom } = require('../services/positioningService');
const { logEvent } = require('../services/sessionLogger');

// Real-time active Server-Sent Events (SSE) connections registry
let sseClients = [];

// Broadcast live occupancy data to all connected web dashboard clients instantly
async function broadcastUpdate() {
  try {
    const data = await compileOccupancyData();
    sseClients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  } catch (err) {
    console.error('[SSE BROADCAST ERROR] Failed to push update:', err);
  }
}

// 1. Activate Drill Session & Initialize Baseline
async function startDrill(req, res) {
  const { name } = req.body;
  const ip = req.ip || '127.0.0.1';

  try {
    // Conclude any existing active drill runs
    await DrillSession.update(
      { status: 'concluded', endedAt: new Date() },
      { where: { status: 'active' } }
    );

    const drill = await DrillSession.create({
      name: name || 'Institutional Earthquake Drill',
      status: 'active',
      activatedAt: new Date()
    });

    // Seed default classroom occupancy baseline list
    // All Students and Teachers/Staff are initialized as 'Location-Unverified'
    const participants = await User.findAll({
      where: {
        role: ['Student', 'Teacher']
      }
    });

    const baselineRecords = participants.map(usr => ({
      drillId: drill.id,
      userId: usr.id,
      roomId: null,
      detectionMethod: 'auto',
      status: 'Location-Unverified',
      timestamp: new Date()
    }));

    if (baselineRecords.length > 0) {
      await ClassroomOccupancy.bulkCreate(baselineRecords);
    }

    await logEvent('login', req.user.email, ip, `Earthquake Drill Run initiated: ${drill.name} (Drill ID: ${drill.id})`);

    // Broadcast update to all connected web dashboard clients in real-time
    broadcastUpdate();

    return res.status(201).json({
      status: 'success',
      action: 'start_drill',
      drill: { id: drill.id, name: drill.name, status: drill.status, activatedAt: drill.activatedAt },
      message: `Active Earthquake Drill Run '${drill.name}' initiated. Headcount baseline mapped.`,
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to start drill session.',
      errors: [error.message]
    });
  }
}

// 2. Conclude Active Drill
async function concludeDrill(req, res) {
  const ip = req.ip || '127.0.0.1';

  try {
    const drill = await DrillSession.findOne({ where: { status: 'active' } });
    if (!drill) {
      return res.status(400).json({
        status: 'error',
        message: 'No active drill run session is currently running.',
        errors: []
      });
    }

    await drill.update({ status: 'concluded', endedAt: new Date() });
    await logEvent('login', req.user.email, ip, `Drill session concluded: ${drill.name} (ID: ${drill.id})`);

    // Broadcast update to all connected web dashboard clients in real-time
    broadcastUpdate();

    return res.status(200).json({
      status: 'success',
      action: 'conclude_drill',
      drill: { id: drill.id, name: drill.name, status: drill.status, endedAt: drill.endedAt },
      message: `Drill Run '${drill.name}' has been successfully concluded.`,
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Conclude drill failed.',
      errors: [error.message]
    });
  }
}

// 3. RSSI Scan & Auto-Detection Triangulation
async function scanPresence(req, res) {
  const { scans } = req.body;
  const ip = req.ip || '127.0.0.1';

  try {
    // Assert active drill run exists
    const drill = await DrillSession.findOne({ where: { status: 'active' } });
    if (!drill) {
      return res.status(400).json({
        status: 'error',
        message: 'No active earthquake drill session is currently running.',
        errors: []
      });
    }

    // Identify user context from authenticated JWT
    const userId = req.user.id;

    // Retrieve active baseline log
    let occupancy = await ClassroomOccupancy.findOne({
      where: { drillId: drill.id, userId }
    });

    if (!occupancy) {
      // Dynamic fallback baseline creator
      occupancy = await ClassroomOccupancy.create({
        drillId: drill.id,
        userId,
        roomId: null,
        status: 'Location-Unverified'
      });
    }

    // Execute Triangulation Weighted Centroid Algorithm
    const pos = await triangulateRSSI(scans);
    let matched = null;

    if (pos) {
      matched = await matchRoom(pos.x, pos.y, pos.floor);
    }

    if (matched) {
      await occupancy.update({
        roomId: matched.id,
        status: 'verified',
        detectionMethod: 'auto',
        timestamp: new Date()
      });

      await logEvent('token_validation', req.user.email, ip, `Auto presence verified at room ${matched.name}`);

      // Broadcast update to all connected web dashboard clients in real-time
      broadcastUpdate();

      return res.status(200).json({
        status: 'success',
        action: 'rssi_scan',
        location: {
          roomId: matched.id,
          name: matched.name,
          floor: matched.floor,
          building: matched.building,
          status: 'verified'
        },
        message: `Auto-triangulated location confirmed at ${matched.name}.`,
        errors: []
      });
    } else {
      // Set to unverified status if signal triangulations fail
      await occupancy.update({
        roomId: null,
        status: 'Location-Unverified',
        detectionMethod: 'auto',
        timestamp: new Date()
      });

      // Broadcast update to all connected web dashboard clients in real-time
      broadcastUpdate();

      return res.status(200).json({
        status: 'success',
        action: 'rssi_scan',
        location: {
          roomId: null,
          name: 'Unverified Location',
          floor: null,
          status: 'Location-Unverified'
        },
        message: 'Signal strength boundaries insufficient. Triangulation failed.',
        errors: ['Triangulation failed. Please submit a manual location override.']
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process signal scan.',
      errors: [error.message]
    });
  }
}

// 4. Manual Fallback Overrides Dropdown Submission
async function manualOverride(req, res) {
  const { roomId } = req.body;
  const ip = req.ip || '127.0.0.1';

  try {
    const drill = await DrillSession.findOne({ where: { status: 'active' } });
    if (!drill) {
      return res.status(400).json({
        status: 'error',
        message: 'No active drill session is currently running.',
        errors: []
      });
    }

    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({
        status: 'error',
        message: 'Campus room code not found.',
        errors: [`Invalid room selection code: ${roomId}`]
      });
    }

    const userId = req.user.id;
    let occupancy = await ClassroomOccupancy.findOne({
      where: { drillId: drill.id, userId }
    });

    if (!occupancy) {
      occupancy = await ClassroomOccupancy.create({
        drillId: drill.id,
        userId,
        roomId: null,
        status: 'Location-Unverified'
      });
    }

    await occupancy.update({
      roomId: room.id,
      status: 'verified',
      detectionMethod: 'manual',
      timestamp: new Date()
    });

    await logEvent('token_validation', req.user.email, ip, `Manual presence override logged for room ${room.name}`);

    // Broadcast update to all connected web dashboard clients in real-time
    broadcastUpdate();

    return res.status(200).json({
      status: 'success',
      action: 'manual_override',
      location: {
        roomId: room.id,
        name: room.name,
        floor: room.floor,
        status: 'verified'
      },
      message: `Manual location override successfully registered for ${room.name}.`,
      errors: []
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to log manual override.',
      errors: [error.message]
    });
  }
}

// Compile occupancy and headcount data metrics dynamically
async function compileOccupancyData() {
  const drill = await DrillSession.findOne({ where: { status: 'active' } });
  if (!drill) {
    return {
      status: 'success',
      action: 'dashboard_sync',
      activeDrill: null,
      message: 'No active earthquake drill session is currently active.',
      rooms: [],
      unverifiedList: [],
      totalParticipants: 0,
      verifiedCount: 0,
      unverifiedCount: 0
    };
  }

  // Gather rooms and active occupants baseline mapping
  const rooms = await Room.findAll();
  const occupancyLogs = await ClassroomOccupancy.findAll({
    where: { drillId: drill.id }
  });
  
  // Resolve User Identity mappings
  const users = await User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'department']
  });

  // Compile Room Headcounts metrics
  const roomHeadcounts = rooms.map(room => {
    const logs = occupancyLogs.filter(l => l.roomId === room.id && l.status === 'verified');
    const autoCount = logs.filter(l => l.detectionMethod === 'auto').length;
    const manualCount = logs.filter(l => l.detectionMethod === 'manual').length;

    return {
      roomId: room.id,
      roomName: room.name,
      floor: room.floor,
      totalHeadcount: logs.length,
      autoRSSI: autoCount,
      manualOverride: manualCount
    };
  });

  // Compile Unverified student rosters for Safety Triaging
  const unverifiedLogs = occupancyLogs.filter(l => l.status === 'Location-Unverified');
  const unverifiedList = unverifiedLogs.map(log => {
    const u = users.find(usr => usr.id === log.userId);
    return {
      userId: log.userId,
      name: u?.name || 'Unknown Student',
      email: u?.email || 'N/A',
      role: u?.role || 'Student',
      department: u?.department || 'BSCS'
    };
  });

  return {
    status: 'success',
    action: 'dashboard_sync',
    activeDrill: { id: drill.id, name: drill.name, activatedAt: drill.activatedAt },
    rooms: roomHeadcounts,
    unverifiedList,
    totalParticipants: occupancyLogs.length,
    verifiedCount: occupancyLogs.filter(l => l.status === 'verified').length,
    unverifiedCount: unverifiedLogs.length,
    message: 'Active drill baseline headcounts synchronizations complete.',
    errors: []
  };
}

// 5. Get Live Headcounts and Occupancy Baselines (Coordinator only)
async function getOccupancyDashboard(req, res) {
  try {
    const data = await compileOccupancyData();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve occupancy dashboards logs.',
      errors: [error.message]
    });
  }
}

// 6. Expose Server-Sent Events (SSE) real-time stream for instant dashboard sync
function registerRealtimeStream(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });

  // Immediately push the current drill baseline configuration to the newly connected dashboard client
  compileOccupancyData().then(data => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }).catch(err => console.error(err));

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
}

function triggerSSEBroadcast(payload) {
  try {
    sseClients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    });
  } catch (err) {
    console.error('[SSE BROADCAST ERROR] Failed to push trigger:', err);
  }
}

// 7. Get currently active drill run session (public query endpoint for mobile apps)
async function getActiveDrill(req, res) {
  try {
    const drill = await DrillSession.findOne({ where: { status: 'active' } });
    return res.status(200).json({
      status: 'success',
      activeDrill: drill ? { id: drill.id, name: drill.name, activatedAt: drill.activatedAt } : null
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve active drill.',
      errors: [error.message]
    });
  }
}

module.exports = {
  startDrill,
  concludeDrill,
  scanPresence,
  manualOverride,
  getOccupancyDashboard,
  registerRealtimeStream,
  triggerSSEBroadcast,
  getActiveDrill
};
