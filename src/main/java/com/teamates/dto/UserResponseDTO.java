package com.teamates.dto;

import com.teamates.model.Gender;
import java.util.UUID;
import java.time.LocalDate;

public record UserResponseDTO(
        UUID userId,
        String firstName,
        String lastName,
        String phone,
        Gender gender,
        String email,
        LocalDate birthDate,
        boolean isProfileComplete
) {}