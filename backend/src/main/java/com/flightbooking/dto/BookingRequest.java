package com.flightbooking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequest {
    @NotNull(message = "Flight ID is required")
    private String flightId;

    //@NotNull(message = "Passenger info is required")
    //private PassengerDTO passenger;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    private String email;

    private String phone;

    private String dateOfBirth;

    private String passportNumber;

    private String nationality;

    @NotBlank(message = "Seat number is required")
    private String seatNumber;

    @NotBlank(message = "Class type is required")
    private String classType;

    private BigDecimal price;

    private String specialRequests;
}
