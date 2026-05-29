package com.evacsense.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "drill_attendance")
public class ClassroomAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "drillId", nullable = false)
    private Integer drillId;

    @Column(name = "userId", nullable = false)
    private String userId;

    @Column(name = "arrivalTime")
    private LocalDateTime arrivalTime;

    private String method; // 'Wi-Fi', 'face', 'peer-assisted', 'manual-marshal'

    @Column(nullable = false)
    private String status = "Absent"; // 'Absent', 'Present', 'Present (Peer-Assisted)', 'Location-Unverified', 'Missing'

    @Column(name = "faceConfidence")
    private Float faceConfidence;

    @Column(name = "isDistress", nullable = false)
    private Boolean isDistress = false;

    @Column(name = "distressLocation")
    private String distressLocation;

    @Column(name = "distressTime")
    private LocalDateTime distressTime;

    @Column(name = "photoPath")
    private String photoPath;

    @Column(name = "verifiedBy")
    private String verifiedBy;

    // Constructors
    public ClassroomAttendance() {}

    public ClassroomAttendance(Integer drillId, String userId, String status) {
        this.drillId = drillId;
        this.userId = userId;
        this.status = status;
        this.isDistress = false;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getDrillId() { return drillId; }
    public void setDrillId(Integer drillId) { this.drillId = drillId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Float getFaceConfidence() { return faceConfidence; }
    public void setFaceConfidence(Float faceConfidence) { this.faceConfidence = faceConfidence; }

    public Boolean getIsDistress() { return isDistress; }
    public void setIsDistress(Boolean distress) { isDistress = distress; }

    public String getDistressLocation() { return distressLocation; }
    public void setDistressLocation(String distressLocation) { this.distressLocation = distressLocation; }

    public LocalDateTime getDistressTime() { return distressTime; }
    public void setDistressTime(LocalDateTime distressTime) { this.distressTime = distressTime; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }
}
