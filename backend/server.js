const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const User = require('./models/userModel');
const Room = require('./models/roomModel');
const AccessPoint = require('./models/accessPointModel');
const DrillSession = require('./models/drillSessionModel');
const ClassroomOccupancy = require('./models/occupancyModel');
const Edge = require('./models/edgeModel');

const authController = require('./controllers/authController');
const drillController = require('./controllers/drillController');
const navigationController = require('./controllers/navigationController');
const authorize = require('./middlewares/rbacMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and parsing of JSON payloads
app.use(cors());
app.use(express.json());

// Public Auth Routes
app.post('/api/auth/login', authController.login);
app.post('/api/auth/google-sso', authController.googleSSO);
app.post('/api/auth/recovery', authController.recoverAccount);

// Registration Use Cases
app.post('/api/auth/register/student', authController.registerStudent);
app.post('/api/auth/register/staff', authController.registerStaff);

// Protected Session Tokens Validation
app.get('/api/auth/validate-token', authorize(), authController.validateToken);
app.post('/api/auth/logout', authorize(), authController.logout);

// Protected Admin Actions (Manage Users and Approvals)
app.get('/api/users', authorize(['System Admin']), authController.listUsers);
app.put('/api/users/:id/role', authorize(['System Admin']), authController.updateRole);
app.get('/api/admin/requests', authorize(['System Admin']), authController.listPendingRequests);
app.put('/api/admin/requests/:id/approve', authorize(['System Admin']), authController.approveRequest);
app.put('/api/admin/requests/:id/reject', authorize(['System Admin']), authController.rejectRequest);

// Protected Module 2: Classroom Presence Recording & Drills
app.get('/api/drill/active', drillController.getActiveDrill);
app.post('/api/drill/start', authorize(['System Admin', 'Drill Coordinator']), drillController.startDrill);
app.post('/api/drill/conclude', authorize(['System Admin', 'Drill Coordinator']), drillController.concludeDrill);
app.get('/api/presence/occupancy', authorize(['System Admin', 'Drill Coordinator']), drillController.getOccupancyDashboard);
app.get('/api/presence/realtime', drillController.registerRealtimeStream);
app.post('/api/presence/scan', authorize(['Student', 'Teacher']), drillController.scanPresence);
app.post('/api/presence/manual', authorize(['Student', 'Teacher']), drillController.manualOverride);

// Protected Module 3: Shortest-Path Evacuation Navigation
app.get('/api/nav/nodes', authorize(), navigationController.getNodes);
app.post('/api/nav/nodes', authorize(['System Admin', 'Drill Coordinator']), navigationController.createNode);
app.get('/api/nav/edges', authorize(), navigationController.getEdges);
app.post('/api/nav/edges', authorize(['System Admin', 'Drill Coordinator']), navigationController.createEdge);
app.post('/api/nav/block', authorize(['System Admin', 'Drill Coordinator']), navigationController.toggleBlockage);
app.get('/api/nav/route', authorize(), navigationController.getEvacuationRoute);

// Error Fallback Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'An unexpected application error occurred.',
    errors: [err.message]
  });
});

// Database Sync and Seeding
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log(`[DATABASE] ${sequelize.getDialect().toUpperCase()} connection established successfully.`);
    
    // Sync tables to keep schemas clean
    await sequelize.sync();
    console.log('[DATABASE] Tables generated successfully.');
    
    // 1. Mock user seeding
    const defaultPasswordHash = await bcrypt.hash('CITCCS2026!', 10);
    
    const mockUsers = [
      {
        id: "USR-001",
        name: "Maria Santos",
        email: "m.santos@student.cit.edu",
        role: "Student",
        department: "BS Information Technology",
        passwordHash: defaultPasswordHash,
        failedAttempts: 0,
        status: "active"
      },
      {
        id: "USR-002",
        name: "Dr. Jose Reyes",
        email: "j.reyes@cit.edu",
        role: "Teacher",
        department: "College of Computer Studies",
        passwordHash: defaultPasswordHash,
        failedAttempts: 0,
        status: "active"
      },
      {
        id: "USR-003",
        name: "Engr. Ana Cruz",
        email: "a.cruz@cit.edu",
        role: "Drill Coordinator",
        department: "Safety Office",
        passwordHash: defaultPasswordHash,
        failedAttempts: 0,
        status: "active"
      },
      {
        id: "USR-004",
        name: "Mr. Carlo Lim",
        email: "c.lim@cit.edu",
        role: "System Admin",
        department: "IT Department",
        passwordHash: defaultPasswordHash,
        failedAttempts: 0,
        status: "active"
      },
      {
        id: "USR-005",
        name: "Juan dela Cruz",
        email: "j.delacruz@student.cit.edu",
        role: "Student",
        department: "BS Computer Science",
        passwordHash: defaultPasswordHash,
        failedAttempts: 0,
        status: "active"
      }
    ];

    await User.bulkCreate(mockUsers, { ignoreDuplicates: true });
    console.log(`[DATABASE] Seeded ${mockUsers.length} active CIT-U users.`);

    // 2. NGE Building (Dr. Nicolas G. Escario Sr. Building) — Real Floor Plan Data
    const { ngeRooms, ngeEdges, ngeAccessPoints } = require('./seed/ngeBuilding');

    // Clear previous data for clean NGE building reseed
    await ClassroomOccupancy.destroy({ where: {} });
    await Edge.destroy({ where: {} });
    await AccessPoint.destroy({ where: {} });
    await Room.destroy({ where: {} });

    await Room.bulkCreate(ngeRooms);
    console.log(`[DATABASE] Seeded ${ngeRooms.length} NGE Building floor zones (4 floors).`);

    await Edge.bulkCreate(ngeEdges);
    console.log(`[DATABASE] Seeded ${ngeEdges.length} evacuation route edges.`);

    // 3. Wi-Fi Access Points (across NGE Building floors)
    await AccessPoint.bulkCreate(ngeAccessPoints);
    console.log(`[DATABASE] Seeded ${ngeAccessPoints.length} NGE Building Wi-Fi Access Points.`);
    console.log('--- DEFAULT ACCOUNT PASSWORD: CITCCS2026! ---');

  } catch (error) {
    console.error('[DATABASE] Core database initialization failed:', error);
  }
}

// Start API Server
app.listen(PORT, async () => {
  await initDatabase();
  console.log(`[SERVER] EvacSense Authentication API running on http://localhost:${PORT}`);
});
