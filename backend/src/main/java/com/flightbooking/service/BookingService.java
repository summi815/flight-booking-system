package com.flightbooking.service;

import com.flightbooking.dto.*;
import com.flightbooking.entity.*;
import com.flightbooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {
    private final BookingRepository bookingRepository;
    private final PassengerRepository passengerRepository;
    private final FlightRepository flightRepository;
    private final FlightSeatRepository flightSeatRepository;

    public BookingDTO createBooking(BookingRequest request, UUID userId) {
        Flight flight = flightRepository.findById(UUID.fromString(request.getFlightId()))
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        // Create or find passenger
        Passenger passenger = Passenger.builder()
                .userId(userId)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth() != null ? LocalDate.parse(request.getDateOfBirth()) : null)
                .passportNumber(request.getPassportNumber())
                .nationality(request.getNationality())
                .build();
        passenger = passengerRepository.save(passenger);

        // Calculate price
        BigDecimal price = "business".equalsIgnoreCase(request.getClassType())
                ? (flight.getBusinessClassPrice() != null ? flight.getBusinessClassPrice() : flight.getBasePrice())
                : flight.getBasePrice();

        // Create booking
        Booking booking = Booking.builder()
                .passenger(passenger)
                .flight(flight)
                .seatNumber(request.getSeatNumber())
                .classType(request.getClassType())
                .price(price)
                .specialRequests(request.getSpecialRequests())
                .status("confirmed")
                .build();

        booking = bookingRepository.save(booking);

        // Mark seat as taken
        Optional<FlightSeat> seat = flightSeatRepository.findByFlightIdAndSeatNumber(
                flight.getId(), request.getSeatNumber());
        if (seat.isPresent()) {
            FlightSeat flightSeat = seat.get();
            flightSeat.setIsAvailable(false);
            flightSeatRepository.save(flightSeat);
        }

        return toDTO(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingDTO> getUserBookings(UUID userId) {
        return bookingRepository.findByPassengerUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDTO getBookingByReference(String bookingReference, UUID userId) {
        return bookingRepository.findByBookingReferenceAndPassengerUserId(bookingReference, userId)
                .map(this::toDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public BookingDTO getBookingByReference(String bookingReference) {
        return bookingRepository.findByBookingReference(bookingReference)
                .map(this::toDTO)
                .orElse(null);
    }

    public void cancelBooking(String bookingReference, UUID userId) {
        Booking booking = bookingRepository.findByBookingReferenceAndPassengerUserId(bookingReference, userId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus("cancelled");
        bookingRepository.save(booking);
    }

    private BookingDTO toDTO(Booking booking) {
        FlightDTO flightDTO = null;
        Flight flight = booking.getFlight();
        if (flight != null) {
            flightDTO = FlightDTO.builder()
                    .id(flight.getId().toString())
                    .flightNumber(flight.getFlightNumber())
                    .departureTime(flight.getDepartureTime())
                    .arrivalTime(flight.getArrivalTime())
                    .durationMinutes(flight.getDurationMinutes())
                    .status(flight.getStatus())
                    .build();

            if (flight.getOriginAirport() != null) {
                flightDTO.setOriginAirport(AirportDTO.builder()
                        .code(flight.getOriginAirport().getCode())
                        .name(flight.getOriginAirport().getName())
                        .city(flight.getOriginAirport().getCity())
                        .country(flight.getOriginAirport().getCountry())
                        .build());
            }
            if (flight.getDestinationAirport() != null) {
                flightDTO.setDestinationAirport(AirportDTO.builder()
                        .code(flight.getDestinationAirport().getCode())
                        .name(flight.getDestinationAirport().getName())
                        .city(flight.getDestinationAirport().getCity())
                        .country(flight.getDestinationAirport().getCountry())
                        .build());
            }
        }

        return BookingDTO.builder()
                .id(booking.getId().toString())
                .bookingReference(booking.getBookingReference())
                .passenger(booking.getPassenger() != null ? PassengerDTO.builder()
                        .id(booking.getPassenger().getId().toString())
                        .userId(booking.getPassenger().getUserId() != null ? booking.getPassenger().getUserId().toString() : null)
                        .firstName(booking.getPassenger().getFirstName())
                        .lastName(booking.getPassenger().getLastName())
                        .email(booking.getPassenger().getEmail())
                        .phone(booking.getPassenger().getPhone())
                        .build() : null)
                .flight(flightDTO)
                .seatNumber(booking.getSeatNumber())
                .classType(booking.getClassType())
                .price(booking.getPrice())
                .status(booking.getStatus())
                .specialRequests(booking.getSpecialRequests())
                .checkedIn(booking.getCheckedIn())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
