package com.flightbooking.repository;

import com.flightbooking.entity.AircraftType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AircraftTypeRepository extends JpaRepository<AircraftType, UUID> {
    Optional<AircraftType> findByModel(String model);
}
