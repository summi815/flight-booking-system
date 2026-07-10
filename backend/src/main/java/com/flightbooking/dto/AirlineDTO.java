package com.flightbooking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AirlineDTO {
    private String id;
    private String code;
    private String name;
    private String logoUrl;
    private String country;
}
