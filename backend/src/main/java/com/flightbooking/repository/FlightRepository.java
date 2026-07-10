package com.flightbooking.repository;

import com.flightbooking.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlightRepository extends JpaRepository<Flight, UUID> {
    Optional<Flight> findByFlightNumber(String flightNumber);

    @Query("SELECT f FROM Flight f JOIN FETCH f.originAirport JOIN FETCH f.destinationAirport " +
           "WHERE f.originAirport.id = :originId AND f.destinationAirport.id = :destinationId " +
           "AND f.departureTime >= :departureFrom AND f.departureTime < :departureTo AND f.status = 'scheduled'")
    List<Flight> searchFlights(
            @Param("originId") UUID originId,
            @Param("destinationId") UUID destinationId,
            @Param("departureFrom") LocalDateTime departureFrom,
            @Param("departureTo") LocalDateTime departureTo);

    @Query("SELECT f FROM Flight f JOIN FETCH f.originAirport JOIN FETCH f.destinationAirport " +
           "WHERE f.originAirport.code = :originCode AND f.destinationAirport.code = :destinationCode " +
           "AND f.departureTime >= :departureFrom AND f.departureTime < :departureTo AND f.status = 'scheduled'")
    List<Flight> searchFlightsByCode(
            @Param("originCode") String originCode,
            @Param("destinationCode") String destinationCode,
            @Param("departureFrom") LocalDateTime departureFrom,
            @Param("departureTo") LocalDateTime departureTo);
}
