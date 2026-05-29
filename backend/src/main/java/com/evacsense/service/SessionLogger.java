package com.evacsense.service;

import com.evacsense.model.AuditLog;
import com.evacsense.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SessionLogger {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logEvent(String event, String email, String ipAddress, String details) {
        try {
            AuditLog log = new AuditLog(event, email, ipAddress, details);
            auditLogRepository.save(log);
            System.out.println("[AUDIT LOG] " + event.toUpperCase() + " for " + (email != null ? email : "Anonymous") + " at " + LocalDateTime.now());
        } catch (Exception e) {
            System.err.println("[DATABASE ERROR] Failed to write audit log: " + e.getMessage());
        }
    }
}
