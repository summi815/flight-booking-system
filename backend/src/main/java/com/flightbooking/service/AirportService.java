package com.flightbooking.service;

import com.flightbooking.dto.AirportDTO;
import com.flightbooking.entity.Airport;
import com.flightbooking.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AirportService {
    private final AirportRepository airportRepository;

    public List<AirportDTO> getAllAirports() {
        return airportRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AirportDTO getAirportByCode(String code) {
        return airportRepository.findByCode(code)
                .map(this::toDTO)
                .orElse(null);
    }

    public List<AirportDTO> searchAirports(String query) {
        if (query == null || query.isEmpty()) {
            return getAllAirports();
        }
        return airportRepository.findByCodeContainingIgnoreCaseOrNameContainingIgnoreCaseOrCityContainingIgnoreCase(query, query, query)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private AirportDTO toDTO(Airport airport) {
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
