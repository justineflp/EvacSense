const Room = require('../models/roomModel');
const Edge = require('../models/edgeModel');

/**
 * Dijkstra's Shortest Path Implementation in JavaScript
 * Automatically respects blocked edges in the database graph.
 */
async function computeShortestPath(startNodeId) {
  // 1. Fetch all nodes and active edges from database
  const nodes = await Room.findAll();
  const edges = await Edge.findAll({ where: { isBlocked: false } });

  // Map nodes to a quick lookup map
  const nodeMap = {};
  nodes.forEach(n => {
    nodeMap[n.id] = n;
  });

  if (!nodeMap[startNodeId]) {
    throw new Error(`Start node '${startNodeId}' is not registered in the system floor map.`);
  }

  // 2. Build Adjacency List (undirected graph)
  const graph = {};
  nodes.forEach(n => {
    graph[n.id] = [];
  });

  edges.forEach(e => {
    // Add connections bidirectionally
    if (graph[e.fromNodeId] && graph[e.toNodeId]) {
      graph[e.fromNodeId].push({ to: e.toNodeId, weight: e.weight, id: e.id });
      graph[e.toNodeId].push({ to: e.fromNodeId, weight: e.weight, id: e.id });
    }
  });

  // 3. Find target exit nodes (those that have 'EXIT' in their ID or floor == 1 and are assembly points)
  const exits = nodes.filter(n => n.id.startsWith('EXIT') || (n.name.toLowerCase().includes('exit') && !n.id.startsWith('STAIR') && !n.name.toLowerCase().includes('stair'))).map(n => n.id);

  if (exits.length === 0) {
    throw new Error("No assembly exit nodes are currently configured in the database.");
  }

  // 4. Run Dijkstra's Algorithm
  const distances = {};
  const previous = {};
  const queue = new Set();

  nodes.forEach(n => {
    distances[n.id] = Infinity;
    previous[n.id] = null;
    queue.add(n.id);
  });

  distances[startNodeId] = 0;

  while (queue.size > 0) {
    // Get node in queue with minimum distance
    let minNode = null;
    queue.forEach(nodeId => {
      if (minNode === null || distances[nodeId] < distances[minNode]) {
        minNode = nodeId;
      }
    });

    if (minNode === null || distances[minNode] === Infinity) {
      break; // Unreachable
    }

    queue.delete(minNode);

    // If minNode is one of the exits, we can potentially stop or continue to find the absolute shortest to any exit
    // Since we want the absolute closest exit, let's keep running or stop if we found an exit and it is the closest
    if (exits.includes(minNode)) {
      // Found shortest path to one of the exits!
      // Since it's Dijkstra, the first exit popped from the queue with finite distance is guaranteed to be the absolute closest exit.
      break;
    }

    // Update neighbors
    const neighbors = graph[minNode] || [];
    neighbors.forEach(neighbor => {
      if (queue.has(neighbor.to)) {
        const alt = distances[minNode] + neighbor.weight;
        if (alt < distances[neighbor.to]) {
          distances[neighbor.to] = alt;
          previous[neighbor.to] = minNode;
        }
      }
    });
  }

  // 5. Identify the closest reached exit
  let targetExit = null;
  let minExitDist = Infinity;

  exits.forEach(exId => {
    if (distances[exId] < minExitDist) {
      minExitDist = distances[exId];
      targetExit = exId;
    }
  });

  if (!targetExit || minExitDist === Infinity) {
    return null; // No path found (e.g. all exits blocked)
  }

  // 6. Reconstruct the path backwards
  const path = [];
  let curr = targetExit;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  // Convert node path to fully resolved objects
  const resolvedPath = path.map(nodeId => nodeMap[nodeId]);

  // 7. Serialize turn-by-turn instructions
  const instructions = serializeRoute(resolvedPath);

  return {
    origin: startNodeId,
    destination: targetExit,
    totalDistance: minExitDist,
    path: resolvedPath,
    instructions
  };
}

/**
 * Route Serializer: Translates a node sequence into human-friendly step-by-step instructions.
 */
function serializeRoute(path) {
  if (path.length <= 1) return ["You have arrived safely at the Assembly Area."];

  const steps = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const current = path[i];
    const next = path[i + 1];

    let action = "";
    if (current.id.startsWith('ROOM') && next.id.startsWith('CORRIDOR')) {
      action = `Exit ${current.name} immediately and proceed to the ${next.name}.`;
    } else if (current.id.startsWith('CORRIDOR') && next.id.startsWith('STAIR')) {
      action = `Walk along the ${current.name} to the ${next.name}.`;
    } else if (current.id.startsWith('STAIR') && next.id.startsWith('STAIR')) {
      const fromFloor = current.floor;
      const toFloor = next.floor;
      const direction = toFloor < fromFloor ? 'Descend' : 'Ascend';
      action = `${direction} the staircase from Floor ${fromFloor} to Floor ${toFloor}.`;
    } else if (current.id.startsWith('STAIR') && next.id.startsWith('EXIT')) {
      action = `Exit the staircase and proceed directly to the ${next.name}. You are approaching the assembly area!`;
    } else if (current.id.startsWith('STAIR') && next.id.startsWith('CORRIDOR')) {
      action = `Exit the staircase onto Floor ${next.floor} and proceed to the ${next.name}.`;
    } else if (current.id.startsWith('CORRIDOR') && next.id.startsWith('CORRIDOR')) {
      action = `Continue along the hallway from ${current.name} to ${next.name}.`;
    } else if (next.id.startsWith('EXIT')) {
      action = `Follow the path directly to the safe zone at ${next.name}.`;
    } else {
      action = `Move from ${current.name} to ${next.name}.`;
    }

    steps.push({
      step: i + 1,
      fromNode: current.id,
      toNode: next.id,
      text: action
    });
  }

  steps.push({
    step: steps.length + 1,
    fromNode: path[path.length - 1].id,
    toNode: path[path.length - 1].id,
    text: "ARRIVED: Confirm evacuation check-in and scan face recognition now."
  });

  return steps;
}

module.exports = {
  computeShortestPath
};
