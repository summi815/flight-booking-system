package com.flightbooking.repository;

import com.flightbooking.entity.FlightSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlightSeatRepository extends JpaRepository<FlightSeat, UUID> {
    List<FlightSeat> findByFlightId(UUID flightId);
    List<FlightSeat> findByFlightIdAndIsAvailableTrue(UUID flightId);
    List<FlightSeat> findByFlightIdAndClassType(UUID flightId, String classType);
    Optional<FlightSeat> findByFlightIdAndSeatNumber(UUID flightId, String seatNumber);

    @Modifying
    @Query("UPDATE FlightSeat fs SET fs.isAvailable = false WHERE fs.id = :seatId")
    void markSeatAsTaken(@Param("seatId") UUID seatId);

    @Query("SELECT COUNT(fs) FROM FlightSeat fs WHERE fs.flight.id = :flightId AND fs.isAvailable = true")
    Long countAvailableSeats(@Param("flightId") UUID flightId);
}
