package com.evacsense.service;

import com.evacsense.model.AccessPoint;
import com.evacsense.model.Room;
import com.evacsense.repository.AccessPointRepository;
import com.evacsense.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PositioningService {

    @Autowired
    private AccessPointRepository accessPointRepository;

    @Autowired
    private RoomRepository roomRepository;

    public static class ScanInput {
        private String macAddress;
        private Integer rssi;

        public ScanInput() {}

        public ScanInput(String macAddress, Integer rssi) {
            this.macAddress = macAddress;
            this.rssi = rssi;
        }

        public String getMacAddress() { return macAddress; }
        public void setMacAddress(String macAddress) { this.macAddress = macAddress; }

        public Integer getRssi() { return rssi; }
        public void setRssi(Integer rssi) { this.rssi = rssi; }
    }

    public static class PositionResult {
        public float x;
        public float y;
        public int floor;

        public PositionResult(float x, float y, int floor) {
            this.x = x;
            this.y = y;
            this.floor = floor;
        }
    }

    public PositionResult triangulateRSSI(List<ScanInput> scans) {
        if (scans == null || scans.isEmpty()) return null;

        try {
            List<String> macs = scans.stream().map(ScanInput::getMacAddress).collect(Collectors.toList());
            List<AccessPoint> aps = accessPointRepository.findByMacAddressIn(macs);

            if (aps.isEmpty()) return null;

            double sumX = 0;
            double sumY = 0;
            double sumWeights = 0;
            int computedFloor = aps.get(0).getFloor(); // Default to the floor of first matched AP

            for (ScanInput scan : scans) {
                Optional<AccessPoint> matchedAp = aps.stream()
                        .filter(a -> a.getMacAddress().equalsIgnoreCase(scan.getMacAddress()))
                        .findFirst();

                if (matchedAp.isEmpty()) continue;

                // Filter out extremely weak signals (below -85 dBm) to prevent coordinate inflation
                if (scan.getRssi() < -85) continue;

                // Weight calculation: linear power weight
                double weight = Math.pow(10, (scan.getRssi() + 100) / 10.0);

                sumX += matchedAp.get().getX() * weight;
                sumY += matchedAp.get().getY() * weight;
                sumWeights += weight;
            }

            if (sumWeights == 0) return null;

            float x = (float) (sumX / sumWeights);
            float y = (float) (sumY / sumWeights);

            return new PositionResult(x, y, computedFloor);

        } catch (Exception e) {
            System.err.println("[TRIANGULATION ERROR] Triangulation process failed: " + e.getMessage());
            return null;
        }
    }

    public Room matchRoom(float x, float y, int floor) {
        try {
            List<Room> rooms = roomRepository.findByFloor(floor);
            
            for (Room room : rooms) {
                if (x >= room.getxMin() && x <= room.getxMax() && y >= room.getyMin() && y <= room.getyMax()) {
                    return room;
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("[ROOM MATCHER ERROR] Room matching process failed: " + e.getMessage());
            return null;
        }
    }
}
