package com.teamates.dto;

import java.util.UUID;

public record UserPublicDTO(
        UUID userId,
        String firstName,
        String lastName
) {}