package com.teamates.dto;

import com.teamates.model.Gender;
import java.util.UUID;

public record UserResponseDTO(
        UUID userId,
        String firstName,
        String lastName,
        String phone,
        Gender gender,
        boolean isProfileComplete
) {}