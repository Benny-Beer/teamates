package com.teamates.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AuthResponseDTO(
        UUID userId,
        String firstName,
        String lastName,
        String gender,
        LocalDate birthDate,
        boolean isProfileComplete
) {}