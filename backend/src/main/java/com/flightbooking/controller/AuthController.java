package com.flightbooking.controller;

import com.flightbooking.dto.*;
import com.flightbooking.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication endpoints")
@CrossOrigin(origins = "*")
public class AuthController {
    private final JwtService jwtService;

    // For demo purposes - in production, this would integrate with Supabase Auth
    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        // In production, validate credentials against Supabase
        // For now, generate a token for demo purposes
        String userId = UUID.nameUUIDFromBytes(request.getEmail().getBytes()).toString();
        String token = jwtService.generateToken(userId, request.getEmail());

        UserDTO user = UserDTO.builder()
                .id(userId)
                .email(request.getEmail())
                .firstName("Demo")
                .lastName("User")
                .build();

        return ResponseEntity.ok(new AuthResponse(token, jwtService.getExpiration(), user));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        // In production, create user in Supabase
        // For demo, just return a token
        String userId = UUID.randomUUID().toString();
        String token = jwtService.generateToken(userId, request.getEmail());

        UserDTO user = UserDTO.builder()
                .id(userId)
                .email(request.getEmail())
                .firstName("New")
                .lastName("User")
                .build();

        return ResponseEntity.ok(new AuthResponse(token, jwtService.getExpiration(), user));
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate JWT token")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestHeader("Authorization") String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            Map<String, Object> error = new HashMap<>();
            error.put("valid", false);
            error.put("error", "No token provided");
            return ResponseEntity.badRequest().body(error);
        }

        String token = authorization.substring(7);
        boolean isValid = jwtService.validateToken(token);

        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        if (isValid) {
            response.put("userId", jwtService.extractUserId(token));
            response.put("email", jwtService.extractEmail(token));
        }

        return ResponseEntity.ok(response);
    }
}
