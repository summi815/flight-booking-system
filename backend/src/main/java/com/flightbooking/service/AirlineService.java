package com.flightbooking.service;

import com.flightbooking.dto.AirlineDTO;
import com.flightbooking.entity.Airline;
import com.flightbooking.repository.AirlineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AirlineService {
    private final AirlineRepository airlineRepository;

    public List<AirlineDTO> getAllAirlines() {
        return airlineRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AirlineDTO getAirlineByCode(String code) {
        return airlineRepository.findByCode(code)
                .map(this::toDTO)
                .orElse(null);
    }

    private AirlineDTO toDTO(Airline airline) {
        return AirlineDTO.builder()
                .id(airline.getId().toString())
                .code(airline.getCode())
                .name(airline.getName())
                .logoUrl(airline.getLogoUrl())
                .country(airline.getCountry())
                .build();
    }
}
