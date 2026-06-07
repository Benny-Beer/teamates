package com.teamates.dto;

import java.util.UUID;

public record AuthResponseDTO(
        UUID userId,
        String firstName,
        String lastName,
        boolean isProfileComplete
) {}