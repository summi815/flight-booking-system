package com.flightbooking.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private String id;
    private String bookingReference;
    private PassengerDTO passenger;
    private FlightDTO flight;
    private String seatNumber;
    private String classType;
    private BigDecimal price;
    private String status;
    private String specialRequests;
    private Boolean checkedIn;
    private LocalDateTime createdAt;
}
