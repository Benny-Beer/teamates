package com.teamates.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RegistrationResponseDTO(
        UUID registrationId,
        UserPublicDTO user,
        LocalDateTime registeredAt
) {}