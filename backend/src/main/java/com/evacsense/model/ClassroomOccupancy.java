package com.evacsense.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "classroom_occupancy")
public class ClassroomOccupancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "drillId", nullable = false)
    private Integer drillId;

    @Column(name = "userId", nullable = false)
    private String userId;

    @Column(name = "roomId")
    private String roomId; // can be null if Location-Unverified

    @Column(name = "detectionMethod", nullable = false)
    private String detectionMethod = "auto"; // 'auto', 'manual'

    @Column(nullable = false)
    private String status = "Location-Unverified"; // 'verified', 'Location-Unverified'

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    // Constructors
    public ClassroomOccupancy() {}

    public ClassroomOccupancy(Integer drillId, String userId, String roomId, String detectionMethod, String status) {
        this.drillId = drillId;
        this.userId = userId;
        this.roomId = roomId;
        this.detectionMethod = detectionMethod;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getDrillId() { return drillId; }
    public void setDrillId(Integer drillId) { this.drillId = drillId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }

    public String getDetectionMethod() { return detectionMethod; }
    public void setDetectionMethod(String detectionMethod) { this.detectionMethod = detectionMethod; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
