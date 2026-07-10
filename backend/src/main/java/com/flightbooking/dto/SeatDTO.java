package com.flightbooking.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatDTO {
    private String id;
    private String seatNumber;
    private String classType;
    private Boolean isAvailable;
    private String price;
    private Boolean isWindow;
    private Boolean isAisle;
    private Integer row;
    private String column;
}
