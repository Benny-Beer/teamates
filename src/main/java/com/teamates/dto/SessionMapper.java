package com.teamates.dto;

import com.teamates.model.Session;
import org.springframework.stereotype.Component;

@Component
public class SessionMapper {

    public SessionResponseDTO toDto(Session session, int currentPlayers) {
        return new SessionResponseDTO(
                session.getSessionId(),
                session.getTitle(),
                session.getSportType(),
                session.getScheduledAt(),
                session.getEndTime(),
                session.getHost().getUserId(),
                session.getHost().getFirstName() + " " + session.getHost().getLastName(),
                session.getFacility().getName(),
                session.getFacility().getAddress(),
                currentPlayers,
                session.getMaxPlayers(),
                session.getAgeMin(),
                session.getAgeMax(),
                session.getGenderPreference()
        );
    }
}