package com.teamates.service;

import com.teamates.model.Session;
import com.teamates.model.SportType;
import com.teamates.model.User;
import com.teamates.model.Facility;
import com.teamates.model.Registration;
import com.teamates.repository.RegistrationRepository;
import com.teamates.repository.FacilityRepository;
import com.teamates.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final FacilityRepository facilityRepository;
    private final RegistrationRepository registrationRepository;

    @Transactional
    public Session createSession(User host, SportType sportType, String title,
                                 LocalDateTime scheduledAt, LocalDateTime endTime,String googlePlaceId,
                                 String facilityName, String facilityAddress,
                                 BigDecimal facilityLatitude, BigDecimal facilityLongitude,
                                 Integer ageMin, Integer ageMax, Integer maxPlayers) {

        // check host overlap
        if (sessionRepository.existsOverlappingSessionForHost(
                host.getUserId(), scheduledAt, endTime)) {
            throw new IllegalArgumentException(
                    "Host already has a session during this time");
        }

        // find existing facility or create new one
        Facility facility = facilityRepository.findByGooglePlaceId(googlePlaceId)
                .orElseGet(() -> {
                    Facility newFacility = new Facility();
                    newFacility.setGooglePlaceId(googlePlaceId);
                    newFacility.setName(facilityName);
                    newFacility.setAddress(facilityAddress);
                    newFacility.setLatitude(facilityLatitude);
                    newFacility.setLongitude(facilityLongitude);
                    return facilityRepository.save(newFacility);
                });

        // check facility overlap
        if (sessionRepository.existsOverlappingSessionForFacility(
                facility.getFacilityId(), scheduledAt, endTime)) {
            throw new IllegalArgumentException(
                    "Facility is already booked during this time");
        }

        Session session = new Session();
        session.setHost(host);
        session.setSportType(sportType);
        session.setTitle(title);
        session.setScheduledAt(scheduledAt);
        session.setEndTime(endTime);
        session.setFacility(facility);
        session.setAgeMin(ageMin);
        session.setAgeMax(ageMax);
        session.setMaxPlayers(maxPlayers);

        Session savedSession = sessionRepository.save(session); // ← save session first

        // auto-register host
        Registration hostRegistration = new Registration();
        hostRegistration.setSession(savedSession); // ← use the saved session
        hostRegistration.setUser(host);
        registrationRepository.save(hostRegistration);

        return savedSession;
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