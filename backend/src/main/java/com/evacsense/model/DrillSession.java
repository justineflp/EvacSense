package com.evacsense.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "drill_sessions")
public class DrillSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String status = "active"; // 'active', 'concluded'

    @Column(name = "activatedAt", nullable = false)
    private LocalDateTime activatedAt = LocalDateTime.now();

    @Column(name = "endedAt")
    private LocalDateTime endedAt;

    // Constructors
    public DrillSession() {}

    public DrillSession(String name, String status, LocalDateTime activatedAt) {
        this.name = name;
        this.status = status;
        this.activatedAt = activatedAt;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getActivatedAt() { return activatedAt; }
    public void setActivatedAt(LocalDateTime activatedAt) { this.activatedAt = activatedAt; }

    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
}
