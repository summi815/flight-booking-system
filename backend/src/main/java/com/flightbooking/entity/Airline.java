package com.flightbooking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "airlines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Airline {
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private java.util.UUID id;

    @Column(name = "code", unique = true, nullable = false, length = 5)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "country")
    private String country;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID();
        createdAt = LocalDateTime.now();
    }
}
