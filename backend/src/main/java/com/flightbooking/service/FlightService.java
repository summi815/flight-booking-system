package com.flightbooking.service;

import com.flightbooking.dto.*;
import com.flightbooking.entity.*;
import com.flightbooking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FlightService {
    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;
    private final FlightSeatRepository flightSeatRepository;

    public List<FlightDTO> searchFlights(FlightSearchRequest request) {
        Airport origin = airportRepository.findByCode(request.getOriginCode())
                .orElseThrow(() -> new RuntimeException("Origin airport not found"));
        Airport destination = airportRepository.findByCode(request.getDestinationCode())
                .orElseThrow(() -> new RuntimeException("Destination airport not found"));

        LocalDateTime departureFrom = request.getDepartureDate().atStartOfDay();
        LocalDateTime departureTo = request.getDepartureDate().atTime(LocalTime.MAX);

        List<Flight> flights = flightRepository.searchFlights(
                origin.getId(),
                destination.getId(),
                departureFrom,
                departureTo
        );

        return flights.stream()
                .map(flight -> toDTO(flight, request.getClassType()))
                .collect(Collectors.toList());
    }

    public FlightDTO getFlightById(String flightId) {
        return flightRepository.findById(UUID.fromString(flightId))
                .map(f -> toDTO(f, null))
                .orElse(null);
    }

    public List<SeatDTO> getAvailableSeats(String flightId, String classType) {
        List<FlightSeat> seats;
        UUID fid = UUID.fromString(flightId);

        if (classType != null && !classType.isEmpty()) {
            seats = flightSeatRepository.findByFlightIdAndClassType(fid, classType);
        } else {
            seats = flightSeatRepository.findByFlightId(fid);
        }

        Flight flight = flightRepository.findById(fid).orElseThrow();
        return generateSeatMap(flight, seats);
    }

    private List<SeatDTO> generateSeatMap(Flight flight, List<FlightSeat> bookedSeats) {
        List<SeatDTO> seatMap = new ArrayList<>();
        int rows = 30;
        String[] columns = {"A", "B", "C", "D", "E", "F"};

        for (int row = 1; row <= rows; row++) {
            for (String col : columns) {
                String seatNumber = row + col;
                String classType = row <= 4 ? "business" : "economy";
                BigDecimal price = "business".equals(classType) && flight.getBusinessClassPrice() != null
                        ? flight.getBusinessClassPrice()
                        : flight.getBasePrice();

                boolean isAvailable = bookedSeats.stream()
                        .noneMatch(s -> s.getSeatNumber().equals(seatNumber) && !s.getIsAvailable());

                seatMap.add(SeatDTO.builder()
                        .seatNumber(seatNumber)
                        .classType(classType)
                        .isAvailable(isAvailable)
                        .price(price.toString())
                        .isWindow(col.equals("A") || col.equals("F"))
                        .isAisle(col.equals("C") || col.equals("D"))
                        .row(row)
                        .column(col)
                        .build());
            }
        }

        return seatMap;
    }

    private FlightDTO toDTO(Flight flight, String requestedClassType) {
        BigDecimal price = flight.getBasePrice();
        if ("business".equalsIgnoreCase(requestedClassType) && flight.getBusinessClassPrice() != null) {
            price = flight.getBusinessClassPrice();
        }

        Long availableSeats = flightSeatRepository.countAvailableSeats(flight.getId());

        return FlightDTO.builder()
                .id(flight.getId().toString())
                .flightNumber(flight.getFlightNumber())
                .airline(flight.getAirline() != null ? toAirlineDTO(flight.getAirline()) : null)
                .aircraftModel(flight.getAircraftType() != null ? flight.getAircraftType().getModel() : null)
                .originAirport(toAirportDTO(flight.getOriginAirport()))
                .destinationAirport(toAirportDTO(flight.getDestinationAirport()))
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .durationMinutes(flight.getDurationMinutes())
                .basePrice(flight.getBasePrice())
                .businessClassPrice(flight.getBusinessClassPrice())
                .status(flight.getStatus())
                .availableSeats(availableSeats)
                .classPrice(price != null ? price.toString() : null)
                .build();
    }

    private AirlineDTO toAirlineDTO(Airline airline) {
        return AirlineDTO.builder()
                .id(airline.getId().toString())
                .code(airline.getCode())
                .name(airline.getName())
                .logoUrl(airline.getLogoUrl())
                .country(airline.getCountry())
                .build();
    }

    private AirportDTO toAirportDTO(Airport airport) {
        return AirportDTO.builder()
                .id(airport.getId().toString())
                .code(airport.getCode())
                .name(airport.getName())
                .city(airport.getCity())
                .country(airport.getCountry())
                .latitude(airport.getLatitude())
                .longitude(airport.getLongitude())
                .build();
    }
}
