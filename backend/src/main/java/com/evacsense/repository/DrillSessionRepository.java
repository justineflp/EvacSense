package com.evacsense.repository;

import com.evacsense.model.DrillSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DrillSessionRepository extends JpaRepository<DrillSession, Integer> {
    Optional<DrillSession> findFirstByStatus(String status);
    List<DrillSession> findByStatus(String status);
}
