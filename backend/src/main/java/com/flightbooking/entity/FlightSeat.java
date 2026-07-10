package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "flight_seats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightSeat {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private java.util.UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id")
    private Flight flight;

    @Column(name = "seat_number", nullable = false, length = 10)
    private String seatNumber;

    @Column(name = "class_type", nullable = false, length = 20)
    private String classType;

    @Column(name = "is_available", nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "price", precision = 12, scale = 2, nullable = false)
    private BigDecimal price;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID();
    }
}
