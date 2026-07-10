package com.flightbooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightSearchRequest {
    @NotNull(message = "Origin airport is required")
    private String originCode;

    @NotNull(message = "Destination airport is required")
    private String destinationCode;

    @NotNull(message = "Departure date is required")
    private LocalDate departureDate;

    private String classType;
    private Integer passengers;
}
