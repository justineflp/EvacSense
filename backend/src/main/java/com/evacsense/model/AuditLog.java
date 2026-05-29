package com.evacsense.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String event; // 'login', 'logout', 'failed_attempt', 'role_update', 'recovery', 'token_validation'

    private String email;

    @Column(name = "ip_address", nullable = true)
    private String ipAddress = "127.0.0.1";

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String details;

    // Constructors
    public AuditLog() {}

    public AuditLog(String event, String email, String ipAddress, String details) {
        this.event = event;
        this.email = email;
        this.ipAddress = ipAddress != null ? ipAddress : "127.0.0.1";
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
