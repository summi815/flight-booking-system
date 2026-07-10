package com.flightbooking.repository;

import com.flightbooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByBookingReference(String bookingReference);

    @Query("SELECT b FROM Booking b JOIN FETCH b.flight f JOIN FETCH f.originAirport JOIN FETCH f.destinationAirport " +
           "WHERE b.passenger.userId = :userId")
    List<Booking> findByPassengerUserId(@Param("userId") UUID userId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.passenger p JOIN FETCH b.flight f " +
           "JOIN FETCH f.originAirport JOIN FETCH f.destinationAirport " +
           "WHERE b.bookingReference = :bookingReference AND p.userId = :userId")
    Optional<Booking> findByBookingReferenceAndPassengerUserId(
            @Param("bookingReference") String bookingReference,
            @Param("userId") UUID userId);
}
