package com.flightbooking.controller;

import com.flightbooking.dto.*;
import com.flightbooking.service.BookingService;
import com.flightbooking.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking management endpoints")
@CrossOrigin(origins = "*")
public class BookingController {
    private final BookingService bookingService;
    private final JwtService jwtService;

    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody BookingRequest request,
            @RequestHeader("Authorization") String authorization) {
        UUID userId = jwtService.extractUserIdFromToken(authorization);
        BookingDTO booking = bookingService.createBooking(request, userId);
        return ResponseEntity.ok(booking);
    }

    @GetMapping
    @Operation(summary = "Get user's bookings")
    public ResponseEntity<List<BookingDTO>> getUserBookings(
            @RequestHeader("Authorization") String authorization) {
        UUID userId = jwtService.extractUserIdFromToken(authorization);
        List<BookingDTO> bookings = bookingService.getUserBookings(userId);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{bookingReference}")
    @Operation(summary = "Get booking by reference")
    public ResponseEntity<BookingDTO> getBookingByReference(
            @PathVariable String bookingReference,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        BookingDTO booking;
        if (authorization != null) {
            UUID userId = jwtService.extractUserIdFromToken(authorization);
            booking = bookingService.getBookingByReference(bookingReference, userId);
        } else {
            booking = bookingService.getBookingByReference(bookingReference);
        }

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(booking);
    }

    @DeleteMapping("/{bookingReference}")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable String bookingReference,
            @RequestHeader("Authorization") String authorization) {
        UUID userId = jwtService.extractUserIdFromToken(authorization);
        bookingService.cancelBooking(bookingReference, userId);
        return ResponseEntity.noContent().build();
    }
}
