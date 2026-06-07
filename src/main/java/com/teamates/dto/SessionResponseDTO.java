package com.teamates.dto;

import com.teamates.model.SportType;
import java.time.LocalDateTime;
import java.util.UUID;

public record SessionResponseDTO(
        UUID sessionId,
        String title,
        SportType sportType,
        LocalDateTime scheduledAt,
        LocalDateTime endTime,
        UUID hostId,
        String hostName,
        String facilityName,
        String facilityAddress,
        int currentPlayers,
        int maxPlayers,
        Integer ageMin,
        Integer ageMax,
        String genderPreference
) {}