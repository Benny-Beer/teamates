package com.teamates.service;

import com.teamates.model.Session;
import com.teamates.model.SportType;
import com.teamates.model.User;
import com.teamates.model.Facility;
import com.teamates.model.Registration;
import com.teamates.repository.RegistrationRepository;
import com.teamates.repository.FacilityRepository;
import com.teamates.repository.SessionRepository;
import com.teamates.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.PrecisionModel;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final FacilityRepository facilityRepository;
    private final RegistrationRepository registrationRepository;
    private final UserService userService;

    @Transactional
    public Session createSession(User host, SportType sportType, String title,
                                 LocalDateTime scheduledAt, LocalDateTime endTime,String googlePlaceId,
                                 String facilityName, String facilityAddress,
                                 BigDecimal facilityLatitude, BigDecimal facilityLongitude,
                                 Integer ageMin, Integer ageMax, Integer maxPlayers) {

        if (!userService.isProfileComplete(host)) {
            throw new IllegalArgumentException(
                    "Please complete your profile before creating a session");
        }

        // check host overlap
        if (sessionRepository.existsOverlappingSessionForHost(
                host.getUserId(), scheduledAt, endTime)) {
            throw new IllegalArgumentException(
                    "Host already has a session during this time");
        }

        // find existing facility or create new one
        Facility facility = facilityRepository.findByGooglePlaceId(googlePlaceId)
                .orElseGet(() -> {
                    GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
                    Point location = geometryFactory.createPoint(
                            new Coordinate(facilityLongitude.doubleValue(), facilityLatitude.doubleValue())
                    );
                    location.setSRID(4326);

                    Facility newFacility = new Facility();
                    newFacility.setGooglePlaceId(googlePlaceId);
                    newFacility.setName(facilityName);
                    newFacility.setAddress(facilityAddress);
                    newFacility.setLocation(location);
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

    @Transactional
    public Session patchSession(UUID sessionId, UUID requestingUserId,
                                String title, LocalDateTime scheduledAt,
                                LocalDateTime endTime, Integer ageMin,
                                Integer ageMax, Integer maxPlayers,
                                String genderPreference) {

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));

        if (!session.getHost().getUserId().equals(requestingUserId)) {
            throw new IllegalArgumentException("Only the host can update the session");
        }

        int registrationCount = registrationRepository
                .countBySessionSessionId(sessionId);

        if (registrationCount > 1) {
            // other players registered — only title can change
            if (title != null) session.setTitle(title);
        } else {
            // host only — can change everything
            if (title != null) session.setTitle(title);
            if (scheduledAt != null) session.setScheduledAt(scheduledAt);
            if (endTime != null) session.setEndTime(endTime);
            if (ageMin != null) session.setAgeMin(ageMin);
            if (ageMax != null) session.setAgeMax(ageMax);
            if (maxPlayers != null) session.setMaxPlayers(maxPlayers);
            if (genderPreference != null) session.setGenderPreference(genderPreference);
        }

        return sessionRepository.save(session);
    }

    public List<Session> getSessionsForUser(UUID userId, String role) {
        if ("host".equalsIgnoreCase(role)) {
            return sessionRepository.findByHostUserId(userId);
        } else if ("player".equalsIgnoreCase(role)) {
            return sessionRepository.findSessionsWhereUserIsPlayer(userId);
        } else {
            return sessionRepository.findAllSessionsForUser(userId);
        }
    }

    @Transactional
    public void deleteSession(UUID sessionId, UUID requestingUserId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));

        if (!session.getHost().getUserId().equals(requestingUserId)) {
            throw new IllegalArgumentException("Only the host can delete the session");
        }

        int registrationCount = registrationRepository.countBySessionSessionId(sessionId);

        if (registrationCount > 1) {
            throw new IllegalArgumentException(
                    "You have players registered. Leave the session instead.");
        }

        registrationRepository.deleteAll(
                registrationRepository.findBySessionSessionIdOrderByRegisteredAtAsc(sessionId));
        sessionRepository.delete(session);
    }


    public Optional<Session> getSessionById(UUID sessionId) {
        return sessionRepository.findById(sessionId);
    }


    public List<Session> getSessionsBySport(SportType sportType) {
        return sessionRepository.findBySportType(sportType);
    }

    public List<Session> searchSessions(double lat, double lng, double radiusMeters,
                                        String sport, Integer ageMin, Integer ageMax,
                                        String gender) {
        LocalDateTime maxDate = LocalDateTime.now().plusMonths(3);
        return sessionRepository.searchSessions(
                lat, lng, radiusMeters, sport, ageMin, ageMax, gender, maxDate);
    }
}