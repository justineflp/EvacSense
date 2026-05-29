package com.evacsense.controller;

import com.evacsense.model.*;
import com.evacsense.repository.*;
import com.evacsense.security.RequireRole;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ReportController {

    @Autowired
    private DrillSessionRepository drillSessionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ClassroomOccupancyRepository classroomOccupancyRepository;

    @Autowired
    private ClassroomAttendanceRepository classroomAttendanceRepository;

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", message);
        return new ResponseEntity<>(response, status);
    }

    // 1. Get drills list
    @RequireRole({"System Admin", "Drill Coordinator"})
    @GetMapping("/reports/list")
    public ResponseEntity<Map<String, Object>> getDrillsList() {
        List<DrillSession> drills = drillSessionRepository.findAll();
        // sort by id desc
        drills.sort((a, b) -> b.getId().compareTo(a.getId()));

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("drills", drills);
        return ResponseEntity.ok(response);
    }

    // 2. Compile analytics safety review
    @RequireRole({"System Admin", "Drill Coordinator"})
    @GetMapping("/reports/report/{drillId}")
    public ResponseEntity<Map<String, Object>> getDrillReport(@PathVariable Integer drillId) {
        Optional<DrillSession> drillOpt = drillSessionRepository.findById(drillId);
        if (drillOpt.isEmpty()) {
            return buildErrorResponse(HttpStatus.NOT_FOUND, "Drill session record not found.");
        }

        DrillSession drill = drillOpt.get();
        List<User> participants = userRepository.findAll();
        List<ClassroomOccupancy> occupancies = classroomOccupancyRepository.findByDrillId(drillId);
        List<ClassroomAttendance> attendances = classroomAttendanceRepository.findByDrillId(drillId);
        List<Room> rooms = roomRepository.findAll();

        // 1. Aggregations
        long totalParticipants = occupancies.size();
        long evacuatedCount = attendances.stream()
                .filter(a -> "Present".equals(a.getStatus()) || "Present (Peer-Assisted)".equals(a.getStatus()))
                .count();
        long missingCount = totalParticipants - evacuatedCount;
        float evacuationRate = totalParticipants > 0 ? (float) (((double) evacuatedCount / totalParticipants) * 100.0) : 0.0f;
        evacuationRate = Math.round(evacuationRate * 100.0f) / 100.0f;

        // Calculate Clear Time (duration from start to end, or last arrival)
        long drillDurationSeconds = 0;
        if (drill.getEndedAt() != null) {
            drillDurationSeconds = Duration.between(drill.getActivatedAt(), drill.getEndedAt()).toSeconds();
        } else if (!attendances.isEmpty()) {
            LocalDateTime lastArrival = null;
            for (ClassroomAttendance a : attendances) {
                if (a.getArrivalTime() != null) {
                    if (lastArrival == null || a.getArrivalTime().isAfter(lastArrival)) {
                        lastArrival = a.getArrivalTime();
                    }
                }
            }
            if (lastArrival != null) {
                drillDurationSeconds = Duration.between(drill.getActivatedAt(), lastArrival).toSeconds();
            }
        }

        String clearTimeFormatted = (drillDurationSeconds / 60) + "m " + (drillDurationSeconds % 60) + "s";

        // 2. Floor by Floor Clearance Analysis
        List<Map<String, Object>> floorClearance = new ArrayList<>();
        for (int floor = 1; floor <= 4; floor++) {
            final int f = floor;
            List<String> roomIdsOnFloor = rooms.stream()
                    .filter(r -> r.getFloor() == f && !"EXIT-CIT-FIELD".equals(r.getId()))
                    .map(Room::getId).toList();

            List<ClassroomOccupancy> floorBaselineLogs = occupancies.stream()
                    .filter(o -> roomIdsOnFloor.contains(o.getRoomId()) && "verified".equals(o.getStatus()))
                    .toList();
            List<String> floorUserIds = floorBaselineLogs.stream().map(ClassroomOccupancy::getUserId).toList();

            List<ClassroomAttendance> floorEvacuatedLogs = attendances.stream()
                    .filter(a -> floorUserIds.contains(a.getUserId()) && 
                            ("Present".equals(a.getStatus()) || "Present (Peer-Assisted)".equals(a.getStatus())))
                    .toList();

            long baselineCount = floorBaselineLogs.size();
            long floorEvacCount = floorEvacuatedLogs.size();
            boolean isCleared = baselineCount == floorEvacCount;

            String clearanceTime = "N/A";
            if (!floorEvacuatedLogs.isEmpty()) {
                LocalDateTime maxArrival = null;
                for (ClassroomAttendance a : floorEvacuatedLogs) {
                    if (a.getArrivalTime() != null) {
                        if (maxArrival == null || a.getArrivalTime().isAfter(maxArrival)) {
                            maxArrival = a.getArrivalTime();
                        }
                    }
                }
                if (maxArrival != null) {
                    long diffSeconds = Duration.between(drill.getActivatedAt(), maxArrival).toSeconds();
                    clearanceTime = (diffSeconds / 60) + "m " + (diffSeconds % 60) + "s";
                }
            }

            floorClearance.add(Map.of(
                    "floor", floor,
                    "totalOccupants", baselineCount,
                    "evacuated", floorEvacCount,
                    "remaining", baselineCount - floorEvacCount,
                    "status", isCleared ? "Cleared" : "Issues/Incomplete",
                    "clearTime", clearanceTime
            ));
        }

        // 3. Chronological Evacuation Timeline
        List<Map<String, Object>> timeline = new ArrayList<>();
        List<ClassroomAttendance> sortedEvac = attendances.stream()
                .filter(a -> a.getArrivalTime() != null && 
                        ("Present".equals(a.getStatus()) || "Present (Peer-Assisted)".equals(a.getStatus())))
                .sorted(Comparator.comparing(ClassroomAttendance::getArrivalTime))
                .toList();

        for (ClassroomAttendance a : sortedEvac) {
            Optional<User> uOpt = participants.stream().filter(usr -> usr.getId().equals(a.getUserId())).findFirst();
            long relativeTimeSeconds = Duration.between(drill.getActivatedAt(), a.getArrivalTime()).toSeconds();
            String relativeTime = (relativeTimeSeconds / 60) + "m " + (relativeTimeSeconds % 60) + "s";

            timeline.add(Map.of(
                    "userId", a.getUserId(),
                    "name", uOpt.isPresent() ? uOpt.get().getName() : "Unknown Student",
                    "department", uOpt.isPresent() && uOpt.get().getDepartment() != null ? uOpt.get().getDepartment() : "N/A",
                    "arrivalTime", a.getArrivalTime().toString(),
                    "relativeTime", relativeTime,
                    "method", a.getMethod() != null ? a.getMethod() : "N/A"
            ));
        }

        // 4. Emergency Distress Summaries
        List<Map<String, Object>> distressLogs = new ArrayList<>();
        List<ClassroomAttendance> distressAtt = attendances.stream().filter(ClassroomAttendance::getIsDistress).toList();
        for (ClassroomAttendance a : distressAtt) {
            Optional<User> uOpt = participants.stream().filter(usr -> usr.getId().equals(a.getUserId())).findFirst();
            distressLogs.add(Map.of(
                    "userId", a.getUserId(),
                    "name", uOpt.isPresent() ? uOpt.get().getName() : "Unknown User",
                    "role", uOpt.isPresent() ? uOpt.get().getRole() : "Student",
                    "location", a.getDistressLocation() != null ? a.getDistressLocation() : "Unknown Corridor",
                    "timestamp", a.getDistressTime() != null ? a.getDistressTime().toString() : ""
            ));
        }

        // 5. Compliance Assessment
        long targetEvacSeconds = 300; // 5 minutes
        boolean isTimeCompliant = drillDurationSeconds <= targetEvacSeconds;
        boolean isRosterCompliant = missingCount == 0;
        String drillGrade = evacuationRate >= 95.0f 
                ? (drillDurationSeconds <= targetEvacSeconds ? "EXCELLENT" : "SATISFACTORY")
                : "NEEDS IMPROVEMENT";

        List<String> recommendations = new ArrayList<>();
        if (evacuationRate < 95.0f) {
            recommendations.add("Increase awareness and practice of immediate Wi-Fi localized check-ins.");
        }
        if (drillDurationSeconds > targetEvacSeconds) {
            recommendations.add("Review floor bottleneck plans on the 3rd and 4th corridors to expedite egress.");
        }
        if (!distressLogs.isEmpty()) {
            recommendations.add("Investigate locations of " + distressLogs.size() + " distress alerts to resolve pathway structural hazards.");
        }
        recommendations.add("Maintain current safety marshaling schedules to sustain high response metrics.");

        Map<String, Object> report = new HashMap<>();
        report.put("drillId", drill.getId());
        report.put("name", drill.getName());
        report.put("activatedAt", drill.getActivatedAt().toString());
        report.put("endedAt", drill.getEndedAt() != null ? drill.getEndedAt().toString() : "");
        report.put("totalParticipants", totalParticipants);
        report.put("evacuatedCount", evacuatedCount);
        report.put("missingCount", missingCount);
        report.put("evacuationRate", evacuationRate);
        report.put("clearTime", clearTimeFormatted);
        report.put("floorClearance", floorClearance);
        report.put("timeline", timeline);
        report.put("distressLogs", distressLogs);
        report.put("complianceAssessment", Map.of(
                "isTimeCompliant", isTimeCompliant,
                "isRosterCompliant", isRosterCompliant,
                "drillGrade", drillGrade,
                "recommendations", recommendations
        ));

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("report", report);

        return ResponseEntity.ok(response);
    }

    // 3. Export Tabular Attendance Log as CSV string
    @GetMapping("/reports/export/csv/{drillId}")
    public void exportCSV(@PathVariable Integer drillId, HttpServletResponse response) throws IOException {
        Optional<DrillSession> drillOpt = drillSessionRepository.findById(drillId);
        if (drillOpt.isEmpty()) {
            response.sendError(HttpServletResponse.SC_NOT_FOUND, "Drill session not found");
            return;
        }

        List<User> participants = userRepository.findAll();
        List<ClassroomOccupancy> occupancies = classroomOccupancyRepository.findByDrillId(drillId);
        List<ClassroomAttendance> attendances = classroomAttendanceRepository.findByDrillId(drillId);
        List<Room> rooms = roomRepository.findAll();

        StringBuilder csv = new StringBuilder("\uFEFF"); // UTF-8 BOM
        csv.append("Student ID,Full Name,Role,Department,Classroom Origin,Floor,Check-In Time,Check-In Channel,Verified Status,Distress Signal Triggered?\n");

        for (ClassroomOccupancy occupancy : occupancies) {
            Optional<User> uOpt = participants.stream().filter(u -> u.getId().equals(occupancy.getUserId())).findFirst();
            if (uOpt.isEmpty()) continue;

            User user = uOpt.get();
            Optional<Room> rOpt = rooms.stream().filter(r -> r.getId().equals(occupancy.getRoomId())).findFirst();
            Optional<ClassroomAttendance> aOpt = attendances.stream().filter(a -> a.getUserId().equals(user.getId())).findFirst();

            String roomName = rOpt.isPresent() ? rOpt.get().getName() : "Location-Unverified";
            String floor = rOpt.isPresent() ? String.valueOf(rOpt.get().getFloor()) : "N/A";
            
            String checkInTime = "N/A";
            String checkInChannel = "N/A";
            String verifiedStatus = "Absent";
            String isDistress = "NO";

            if (aOpt.isPresent()) {
                ClassroomAttendance attendance = aOpt.get();
                if (attendance.getArrivalTime() != null) {
                    checkInTime = attendance.getArrivalTime().toLocalTime().toString().substring(0, 8);
                }
                if (attendance.getMethod() != null) {
                    checkInChannel = attendance.getMethod();
                }
                verifiedStatus = attendance.getStatus();
                isDistress = attendance.getIsDistress() ? "YES (\uD83D\uDEA8)" : "NO";
            }

            csv.append("\"").append(user.getId()).append("\",")
               .append("\"").append(user.getName()).append("\",")
               .append("\"").append(user.getRole()).append("\",")
               .append("\"").append(user.getDepartment() != null ? user.getDepartment() : "N/A").append("\",")
               .append("\"").append(roomName).append("\",")
               .append(floor).append(",")
               .append("\"").append(checkInTime).append("\",")
               .append("\"").append(checkInChannel).append("\",")
               .append("\"").append(verifiedStatus).append("\",")
               .append("\"").append(isDistress).append("\"\n");
        }

        response.setContentType("text/csv; charset=utf-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"EvacSense_Drill_Report_" + drillId + ".csv\"");
        response.getWriter().write(csv.toString());
    }
}
