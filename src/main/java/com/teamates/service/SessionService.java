package com.teamates.service;

import com.teamates.model.Session;
import com.teamates.model.SportType;
import com.teamates.model.User;
import com.teamates.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;

    public Session createSession(User host, SportType sportType, String title,
                                 LocalDateTime scheduledAt, BigDecimal latitude,
                                 BigDecimal longitude, String address,
                                 Integer ageMin, Integer ageMax,
                                 Integer maxPlayers) {
        Session session = new Session();
        session.setHost(host);
        session.setSportType(sportType);
        session.setTitle(title);
        session.setScheduledAt(scheduledAt);
        session.setLatitude(latitude);
        session.setLongitude(longitude);
        session.setAddress(address);
        session.setAgeMin(ageMin);
        session.setAgeMax(ageMax);
        session.setMaxPlayers(maxPlayers);

        return sessionRepository.save(session);
    }



    public Optional<Session> getSessionById(UUID sessionId) {
        return sessionRepository.findById(sessionId);
    }

    public List<Session> getSessionsByHost(UUID hostUserId) {
        return sessionRepository.findByHostUserId(hostUserId);
    }

    public List<Session> getSessionsBySport(SportType sportType) {
        return sessionRepository.findBySportType(sportType);
    }
}