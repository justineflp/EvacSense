package com.evacsense.controller;

import com.evacsense.model.Edge;
import com.evacsense.model.Room;
import com.evacsense.repository.EdgeRepository;
import com.evacsense.repository.RoomRepository;
import com.evacsense.security.RequireRole;
import com.evacsense.service.PathfindingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class NavigationController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EdgeRepository edgeRepository;

    @Autowired
    private PathfindingService pathfindingService;

    @Autowired
    private DrillController drillController;

    // 1. Get all nodes
    @RequireRole
    @GetMapping("/nav/nodes")
    public ResponseEntity<Map<String, Object>> getNodes() {
        List<Room> nodes = roomRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("nodes", nodes);
        return ResponseEntity.ok(response);
    }

    // 2. Create a new node
    @RequireRole({"System Admin", "Drill Coordinator"})
    @PostMapping("/nav/nodes")
    public ResponseEntity<Map<String, Object>> createNode(@RequestBody Map<String, Object> body) {
        String id = (String) body.get("id");
        String name = (String) body.get("name");
        Integer floor = (Integer) body.get("floor");
        String building = (String) body.get("building");
        Float xMin = body.get("xMin") != null ? ((Number) body.get("xMin")).floatValue() : 0.0f;
        Float xMax = body.get("xMax") != null ? ((Number) body.get("xMax")).floatValue() : 5.0f;
        Float yMin = body.get("yMin") != null ? ((Number) body.get("yMin")).floatValue() : 0.0f;
        Float yMax = body.get("yMax") != null ? ((Number) body.get("yMax")).floatValue() : 5.0f;

        if (id == null || name == null || floor == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Missing required parameters (id, name, floor).");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        Optional<Room> existing = roomRepository.findById(id);
        if (existing.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Node with code '" + id + "' already exists.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        Room node = new Room(
                id,
                name,
                floor,
                building != null ? building : "College of Computer Studies",
                xMin,
                xMax,
                yMin,
                yMax
        );
        roomRepository.save(node);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("node", node);
        response.put("message", "Navigation node '" + name + "' created successfully.");

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 3. Get all edges
    @RequireRole
    @GetMapping("/nav/edges")
    public ResponseEntity<Map<String, Object>> getEdges() {
        List<Edge> edges = edgeRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("edges", edges);
        return ResponseEntity.ok(response);
    }

    // 4. Create an edge
    @RequireRole({"System Admin", "Drill Coordinator"})
    @PostMapping("/nav/edges")
    public ResponseEntity<Map<String, Object>> createEdge(@RequestBody Map<String, Object> body) {
        String fromNodeId = (String) body.get("fromNodeId");
        String toNodeId = (String) body.get("toNodeId");
        Float weight = body.get("weight") != null ? ((Number) body.get("weight")).floatValue() : 1.0f;

        if (fromNodeId == null || toNodeId == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Missing fromNodeId or toNodeId.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        Optional<Room> fromNode = roomRepository.findById(fromNodeId);
        Optional<Room> toNode = roomRepository.findById(toNodeId);

        if (fromNode.isEmpty() || toNode.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "One or both of the selected connection nodes do not exist.");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        Edge edge = new Edge(fromNodeId, toNodeId, weight, false);
        edgeRepository.save(edge);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("edge", edge);
        response.put("message", "Map connection established successfully.");

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 5. Toggle pathway blockage
    @RequireRole({"System Admin", "Drill Coordinator"})
    @PostMapping("/nav/block")
    public ResponseEntity<Map<String, Object>> toggleBlockage(@RequestBody Map<String, Object> body) {
        Integer edgeId = (Integer) body.get("edgeId");
        Boolean isBlocked = (Boolean) body.get("isBlocked");

        if (edgeId == null || isBlocked == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Missing required parameters (edgeId, isBlocked).");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        Optional<Edge> edgeOpt = edgeRepository.findById(edgeId);
        if (edgeOpt.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Graph link with ID " + edgeId + " not found.");
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        Edge edge = edgeOpt.get();
        edge.setIsBlocked(isBlocked);
        edgeRepository.save(edge);

        // Broadcaster SSE route recomputation
        Map<String, Object> ssePayload = new HashMap<>();
        ssePayload.put("type", "route_recompute");
        ssePayload.put("edgeId", edgeId);
        ssePayload.put("isBlocked", edge.getIsBlocked());
        ssePayload.put("message", "Routing path changed! A blockage was reported between " + edge.getFromNodeId() + " and " + edge.getToNodeId() + ".");
        
        drillController.triggerSSEBroadcast(ssePayload);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("edge", edge);
        response.put("message", "Map link blockage updated successfully. Link is now " + (edge.getIsBlocked() ? "BLOCKED" : "CLEAR") + ".");

        return ResponseEntity.ok(response);
    }

    // 6. Compute shortest path
    @RequireRole
    @GetMapping("/nav/route")
    public ResponseEntity<Map<String, Object>> getEvacuationRoute(@RequestParam String origin) {
        if (origin == null || origin.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Origin room code parameter is required.");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        try {
            PathfindingService.PathResult route = pathfindingService.computeShortestPath(origin);
            Map<String, Object> response = new HashMap<>();

            if (route == null) {
                response.put("status", "error");
                response.put("message", "No clear evacuation path found. Please follow manual marshal directions to the nearest exit.");
                response.put("fallbackNode", "EXIT-WEST");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            response.put("status", "success");
            response.put("route", route);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Pathfinding calculation failed.");
            error.put("errors", Arrays.asList(e.getMessage()));
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
