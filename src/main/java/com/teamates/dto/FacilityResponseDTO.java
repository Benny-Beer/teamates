package com.teamates.dto;

import java.util.UUID;

public record FacilityResponseDTO(
        UUID facilityId,
        String googlePlaceId,
        String name,
        String address,
        double latitude,
        double longitude
) {}
