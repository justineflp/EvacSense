package com.evacsense.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    private String id; // e.g. "ROOM-401"

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer floor;

    @Column(nullable = false)
    private String building = "College of Computer Studies";

    @Column(name = "xMin", nullable = false)
    private Float xMin;

    @Column(name = "xMax", nullable = false)
    private Float xMax;

    @Column(name = "yMin", nullable = false)
    private Float yMin;

    @Column(name = "yMax", nullable = false)
    private Float yMax;

    // Constructors
    public Room() {}

    public Room(String id, String name, Integer floor, String building, Float xMin, Float xMax, Float yMin, Float yMax) {
        this.id = id;
        this.name = name;
        this.floor = floor;
        this.building = building;
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public Float getxMin() { return xMin; }
    public void setxMin(Float xMin) { this.xMin = xMin; }

    public Float getxMax() { return xMax; }
    public void setxMax(Float xMax) { this.xMax = xMax; }

    public Float getyMin() { return yMin; }
    public void setyMin(Float yMin) { this.yMin = yMin; }

    public Float getyMax() { return yMax; }
    public void setyMax(Float yMax) { this.yMax = yMax; }
}
