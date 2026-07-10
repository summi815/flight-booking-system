package com.flightbooking.controller;

import com.flightbooking.dto.*;
import com.flightbooking.service.FlightService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/flights")
@RequiredArgsConstructor
@Tag(name = "Flights", description = "Flight search and management endpoints")
@CrossOrigin(origins = "*")
public class FlightController {
    private final FlightService flightService;

    @PostMapping("/search")
    @Operation(summary = "Search for flights")
    public ResponseEntity<List<FlightDTO>> searchFlights(@Valid @RequestBody FlightSearchRequest request) {
        List<FlightDTO> flights = flightService.searchFlights(request);
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/{flightId}")
    @Operation(summary = "Get flight by ID")
    public ResponseEntity<FlightDTO> getFlightById(@PathVariable String flightId) {
        FlightDTO flight = flightService.getFlightById(flightId);
        if (flight == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(flight);
    }

    @GetMapping("/{flightId}/seats")
    @Operation(summary = "Get available seats for a flight")
    public ResponseEntity<List<SeatDTO>> getAvailableSeats(
            @PathVariable String flightId,
            @RequestParam(required = false) String classType) {
        List<SeatDTO> seats = flightService.getAvailableSeats(flightId, classType);
        return ResponseEntity.ok(seats);
    }
}
