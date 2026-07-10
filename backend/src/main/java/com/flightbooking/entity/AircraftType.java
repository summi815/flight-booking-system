package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "aircraft_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AircraftType {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private java.util.UUID id;

    @Column(name = "model", nullable = false)
    private String model;

    @Column(name = "manufacturer", nullable = false)
    private String manufacturer;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Column(name = "business_class_seats")
    private Integer businessClassSeats;

    @Column(name = "economy_class_seats", nullable = false)
    private Integer economyClassSeats;

    @Column(name = "seat_layout", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String seatLayout;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID();
        createdAt = LocalDateTime.now();
    }
}
