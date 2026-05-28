const Room = require('../models/roomModel');
const Edge = require('../models/edgeModel');
const { computeShortestPath } = require('../services/pathfindingService');
const drillController = require('./drillController');

// 1. Get all nodes
async function getNodes(req, res) {
  try {
    const nodes = await Room.findAll();
    return res.status(200).json({
      status: 'success',
      nodes
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve navigation nodes.',
      errors: [error.message]
    });
  }
}

// 2. Create a new node (corridor, stair, exit, etc.)
async function createNode(req, res) {
  const { id, name, floor, building, xMin, xMax, yMin, yMax } = req.body;
  try {
    const existing = await Room.findByPk(id);
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Node with code '${id}' already exists.`
      });
    }

    const node = await Room.create({
      id,
      name,
      floor,
      building: building || 'College of Computer Studies',
      xMin: xMin || 0,
      xMax: xMax || 5,
      yMin: yMin || 0,
      yMax: yMax || 5
    });

    return res.status(201).json({
      status: 'success',
      node,
      message: `Navigation node '${name}' created successfully.`
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create navigation node.',
      errors: [error.message]
    });
  }
}

// 3. Get all edges
async function getEdges(req, res) {
  try {
    const edges = await Edge.findAll();
    return res.status(200).json({
      status: 'success',
      edges
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve graph connections.',
      errors: [error.message]
    });
  }
}

// 4. Create an edge
async function createEdge(req, res) {
  const { fromNodeId, toNodeId, weight } = req.body;
  try {
    const fromExists = await Room.findByPk(fromNodeId);
    const toExists = await Room.findByPk(toNodeId);

    if (!fromExists || !toExists) {
      return res.status(404).json({
        status: 'error',
        message: 'One or both of the selected connection nodes do not exist.'
      });
    }

    const edge = await Edge.create({
      fromNodeId,
      toNodeId,
      weight: parseFloat(weight) || 1.0,
      isBlocked: false
    });

    return res.status(201).json({
      status: 'success',
      edge,
      message: 'Map connection established successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create connection edge.',
      errors: [error.message]
    });
  }
}

// 5. Toggle path blockage (simulate collapse/fire)
async function toggleBlockage(req, res) {
  const { edgeId, isBlocked } = req.body;
  try {
    const edge = await Edge.findByPk(edgeId);
    if (!edge) {
      return res.status(404).json({
        status: 'error',
        message: `Graph link with ID ${edgeId} not found.`
      });
    }

    await edge.update({ isBlocked: !!isBlocked });

    // Trigger dynamic recalculation push to web clients via SSE!
    // Since drillController registers SSE, we can import it and invoke it
    if (drillController && typeof drillController.triggerSSEBroadcast === 'function') {
      await drillController.triggerSSEBroadcast({
        type: 'route_recompute',
        edgeId,
        isBlocked: edge.isBlocked,
        message: `Routing path changed! A blockage was reported between ${edge.fromNodeId} and ${edge.toNodeId}.`
      });
    }

    return res.status(200).json({
      status: 'success',
      edge,
      message: `Map link blockage updated successfully. Link is now ${edge.isBlocked ? 'BLOCKED' : 'CLEAR'}.`
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to toggle blockage state.',
      errors: [error.message]
    });
  }
}

// 6. Get Shortest Evacuation Path
async function getEvacuationRoute(req, res) {
  const { origin } = req.query;

  if (!origin) {
    return res.status(400).json({
      status: 'error',
      message: 'Origin room code parameter is required.'
    });
  }

  try {
    const route = await computeShortestPath(origin);
    if (!route) {
      return res.status(404).json({
        status: 'error',
        message: 'No clear evacuation path found. Please follow manual marshal directions to the nearest exit.',
        fallbackNode: 'EXIT-WEST' // default safe exit
      });
    }

    return res.status(200).json({
      status: 'success',
      route
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Pathfinding calculation failed.',
      errors: [error.message]
    });
  }
}

module.exports = {
  getNodes,
  createNode,
  getEdges,
  createEdge,
  toggleBlockage,
  getEvacuationRoute
};
