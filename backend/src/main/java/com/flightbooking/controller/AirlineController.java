package com.flightbooking.controller;

import com.flightbooking.dto.AirlineDTO;
import com.flightbooking.service.AirlineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/airlines")
@RequiredArgsConstructor
@Tag(name = "Airlines", description = "Airline management endpoints")
@CrossOrigin(origins = "*")
public class AirlineController {
    private final AirlineService airlineService;

    @GetMapping
    @Operation(summary = "Get all airlines")
    public ResponseEntity<List<AirlineDTO>> getAllAirlines() {
        return ResponseEntity.ok(airlineService.getAllAirlines());
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get airline by code")
    public ResponseEntity<AirlineDTO> getAirlineByCode(@PathVariable String code) {
        AirlineDTO airline = airlineService.getAirlineByCode(code);
        if (airline == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(airline);
    }
}
