package com.evacsense.repository;

import com.evacsense.model.AccessPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccessPointRepository extends JpaRepository<AccessPoint, String> {
    Optional<AccessPoint> findByMacAddress(String macAddress);
    List<AccessPoint> findByMacAddressIn(List<String> macAddresses);
}
