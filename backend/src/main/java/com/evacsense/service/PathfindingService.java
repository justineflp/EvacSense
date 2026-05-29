package com.evacsense.service;

import com.evacsense.model.Edge;
import com.evacsense.model.Room;
import com.evacsense.repository.EdgeRepository;
import com.evacsense.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PathfindingService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EdgeRepository edgeRepository;

    public static class PathResult {
        public String origin;
        public String destination;
        public double totalDistance;
        public List<Room> path;
        public List<InstructionStep> instructions;

        public PathResult(String origin, String destination, double totalDistance, List<Room> path, List<InstructionStep> instructions) {
            this.origin = origin;
            this.destination = destination;
            this.totalDistance = totalDistance;
            this.path = path;
            this.instructions = instructions;
        }
    }

    public static class InstructionStep {
        public int step;
        public String fromNode;
        public String toNode;
        public String text;

        public InstructionStep(int step, String fromNode, String toNode, String text) {
            this.step = step;
            this.fromNode = fromNode;
            this.toNode = toNode;
            this.text = text;
        }
    }

    public PathResult computeShortestPath(String startNodeId) {
        // 1. Fetch all nodes and active edges
        List<Room> nodes = roomRepository.findAll();
        List<Edge> edges = edgeRepository.findByIsBlocked(false);

        Map<String, Room> nodeMap = nodes.stream().collect(Collectors.toMap(Room::getId, n -> n));

        if (!nodeMap.containsKey(startNodeId)) {
            throw new RuntimeException("Start node '" + startNodeId + "' is not registered in the system floor map.");
        }

        // 2. Build Adjacency List (undirected graph)
        Map<String, List<GraphNeighbor>> graph = new HashMap<>();
        for (Room node : nodes) {
            graph.put(node.getId(), new ArrayList<>());
        }

        for (Edge edge : edges) {
            if (graph.containsKey(edge.getFromNodeId()) && graph.containsKey(edge.getToNodeId())) {
                graph.get(edge.getFromNodeId()).add(new GraphNeighbor(edge.getToNodeId(), edge.getWeight(), edge.getId()));
                graph.get(edge.getToNodeId()).add(new GraphNeighbor(edge.getFromNodeId(), edge.getWeight(), edge.getId()));
            }
        }

        // 3. Find exit nodes
        List<String> exits = nodes.stream()
                .filter(n -> n.getId().startsWith("EXIT") || 
                        (n.getName().toLowerCase().contains("exit") && 
                         !n.getId().startsWith("STAIR") && 
                         !n.getName().toLowerCase().contains("stair")))
                .map(Room::getId)
                .collect(Collectors.toList());

        if (exits.isEmpty()) {
            throw new RuntimeException("No assembly exit nodes are currently configured in the database.");
        }

        // 4. Run Dijkstra's Algorithm
        Map<String, Double> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        Set<String> queue = new HashSet<>();

        for (Room node : nodes) {
            distances.put(node.getId(), Double.POSITIVE_INFINITY);
            previous.put(node.getId(), null);
            queue.add(node.getId());
        }

        distances.put(startNodeId, 0.0);

        while (!queue.isEmpty()) {
            // Find node in queue with minimum distance
            String minNode = null;
            for (String nodeId : queue) {
                if (minNode == null || distances.get(nodeId) < distances.get(minNode)) {
                    minNode = nodeId;
                }
            }

            if (minNode == null || distances.get(minNode) == Double.POSITIVE_INFINITY) {
                break; // Unreachable
            }

            queue.remove(minNode);

            // Since it's Dijkstra, first exit popped from the queue with finite distance is the absolute closest
            if (exits.contains(minNode)) {
                break;
            }

            // Update neighbors
            List<GraphNeighbor> neighbors = graph.getOrDefault(minNode, Collections.emptyList());
            for (GraphNeighbor neighbor : neighbors) {
                if (queue.contains(neighbor.to)) {
                    double alt = distances.get(minNode) + neighbor.weight;
                    if (alt < distances.get(neighbor.to)) {
                        distances.put(neighbor.to, alt);
                        previous.put(neighbor.to, minNode);
                    }
                }
            }
        }

        // 5. Identify the closest reached exit
        String targetExit = null;
        double minExitDist = Double.POSITIVE_INFINITY;

        for (String exId : exits) {
            double dist = distances.get(exId);
            if (dist < minExitDist) {
                minExitDist = dist;
                targetExit = exId;
            }
        }

        if (targetExit == null || minExitDist == Double.POSITIVE_INFINITY) {
            return null; // No path found
        }

        // 6. Reconstruct the path backwards
        LinkedList<String> pathIds = new LinkedList<>();
        String curr = targetExit;
        while (curr != null) {
            pathIds.addFirst(curr);
            curr = previous.get(curr);
        }

        List<Room> resolvedPath = pathIds.stream().map(nodeMap::get).collect(Collectors.toList());

        // 7. Serialize step instructions
        List<InstructionStep> instructions = serializeRoute(resolvedPath);

        return new PathResult(startNodeId, targetExit, minExitDist, resolvedPath, instructions);
    }

    private List<InstructionStep> serializeRoute(List<Room> path) {
        List<InstructionStep> steps = new ArrayList<>();
        if (path.size() <= 1) {
            steps.add(new InstructionStep(1, path.get(0).getId(), path.get(0).getId(), "You have arrived safely at the Assembly Area."));
            return steps;
        }

        for (int i = 0; i < path.size() - 1; i++) {
            Room current = path.get(i);
            Room next = path.get(i + 1);
            String action = "";

            if (current.getId().startsWith("ROOM") && next.getId().startsWith("CORRIDOR")) {
                action = "Exit " + current.getName() + " immediately and proceed to the " + next.getName() + ".";
            } else if (current.getId().startsWith("CORRIDOR") && next.getId().startsWith("STAIR")) {
                action = "Walk along the " + current.getName() + " to the " + next.getName() + ".";
            } else if (current.getId().startsWith("STAIR") && next.getId().startsWith("STAIR")) {
                int fromFloor = current.getFloor();
                int toFloor = next.getFloor();
                String direction = toFloor < fromFloor ? "Descend" : "Ascend";
                action = direction + " the staircase from Floor " + fromFloor + " to Floor " + toFloor + ".";
            } else if (current.getId().startsWith("STAIR") && next.getId().startsWith("EXIT")) {
                action = "Exit the staircase and proceed directly to the " + next.getName() + ". You are approaching the assembly area!";
            } else if (current.getId().startsWith("STAIR") && next.getId().startsWith("CORRIDOR")) {
                action = "Exit the staircase onto Floor " + next.getFloor() + " and proceed to the " + next.getName() + ".";
            } else if (current.getId().startsWith("CORRIDOR") && next.getId().startsWith("CORRIDOR")) {
                action = "Continue along the hallway from " + current.getName() + " to " + next.getName() + ".";
            } else if (next.getId().startsWith("EXIT")) {
                action = "Follow the path directly to the safe zone at " + next.getName() + ".";
            } else {
                action = "Move from " + current.getName() + " to " + next.getName() + ".";
            }

            steps.add(new InstructionStep(i + 1, current.getId(), next.getId(), action));
        }

        String lastId = path.get(path.size() - 1).getId();
        steps.add(new InstructionStep(steps.size() + 1, lastId, lastId, "ARRIVED: Confirm evacuation check-in and scan face recognition now."));

        return steps;
    }

    private static class GraphNeighbor {
        public String to;
        public float weight;
        public int edgeId;

        public GraphNeighbor(String to, float weight, int edgeId) {
            this.to = to;
            this.weight = weight;
            this.edgeId = edgeId;
        }
    }
}
