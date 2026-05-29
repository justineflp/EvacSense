package com.evacsense.model;

import jakarta.persistence.*;

@Entity
@Table(name = "edges")
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fromNodeId", nullable = false)
    private String fromNodeId;

    @Column(name = "toNodeId", nullable = false)
    private String toNodeId;

    @Column(nullable = false)
    private Float weight = 1.0f;

    @Column(name = "isBlocked", nullable = false)
    private Boolean isBlocked = false;

    // Constructors
    public Edge() {}

    public Edge(String fromNodeId, String toNodeId, Float weight, Boolean isBlocked) {
        this.fromNodeId = fromNodeId;
        this.toNodeId = toNodeId;
        this.weight = weight;
        this.isBlocked = isBlocked;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFromNodeId() { return fromNodeId; }
    public void setFromNodeId(String fromNodeId) { this.fromNodeId = fromNodeId; }

    public String getToNodeId() { return toNodeId; }
    public void setToNodeId(String toNodeId) { this.toNodeId = toNodeId; }

    public Float getWeight() { return weight; }
    public void setWeight(Float weight) { this.weight = weight; }

    public Boolean getIsBlocked() { return isBlocked; }
    public void setIsBlocked(Boolean blocked) { isBlocked = blocked; }
}
