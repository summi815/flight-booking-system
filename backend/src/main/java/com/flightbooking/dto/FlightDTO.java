package com.flightbooking.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightDTO {
    private String id;
    private String flightNumber;
    private AirlineDTO airline;
    private String aircraftModel;
    private AirportDTO originAirport;
    private AirportDTO destinationAirport;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Integer durationMinutes;
    private String formattedDuration;
    private BigDecimal basePrice;
    private BigDecimal businessClassPrice;
    private String status;
    private Long availableSeats;
    private String classPrice;

    public String getFormattedDuration() {
        if (durationMinutes == null) return "";
        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;
        return hours + "h " + minutes + "m";
    }
}
