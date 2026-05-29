package com.evacsense.model;

import jakarta.persistence.*;

@Entity
@Table(name = "access_points")
public class AccessPoint {

    @Id
    private String id; // e.g. "AP-01"

    @Column(name = "macAddress", nullable = false, unique = true)
    private String macAddress;

    @Column(nullable = false)
    private String ssid = "CITU_WiFi_Secure";

    @Column(nullable = false)
    private Float x;

    @Column(nullable = false)
    private Float y;

    @Column(nullable = false)
    private Integer floor;

    // Constructors
    public AccessPoint() {}

    public AccessPoint(String id, String macAddress, String ssid, Float x, Float y, Integer floor) {
        this.id = id;
        this.macAddress = macAddress;
        this.ssid = ssid;
        this.x = x;
        this.y = y;
        this.floor = floor;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getMacAddress() { return macAddress; }
    public void setMacAddress(String macAddress) { this.macAddress = macAddress; }

    public String getSsid() { return ssid; }
    public void setSsid(String ssid) { this.ssid = ssid; }

    public Float getX() { return x; }
    public void setX(Float x) { this.x = x; }

    public Float getY() { return y; }
    public void setY(Float y) { this.y = y; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
}
