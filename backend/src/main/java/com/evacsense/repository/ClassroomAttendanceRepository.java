package com.evacsense.repository;

import com.evacsense.model.ClassroomAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomAttendanceRepository extends JpaRepository<ClassroomAttendance, Integer> {
    List<ClassroomAttendance> findByDrillId(Integer drillId);
    Optional<ClassroomAttendance> findByDrillIdAndUserId(Integer drillId, String userId);
    void deleteByDrillId(Integer drillId);
}
