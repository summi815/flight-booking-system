package com.flightbooking.repository;

import com.flightbooking.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AirportRepository extends JpaRepository<Airport, UUID> {
    Optional<Airport> findByCode(String code);
    List<Airport> findByCityContainingIgnoreCase(String city);
    List<Airport> findByCountryContainingIgnoreCase(String country);
    List<Airport> findByCodeContainingIgnoreCaseOrNameContainingIgnoreCaseOrCityContainingIgnoreCase(String code, String name, String city);
}
