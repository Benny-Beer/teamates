package com.teamates.service;

import com.teamates.model.Registration;
import com.teamates.model.Session;
import com.teamates.model.User;
import com.teamates.repository.RegistrationRepository;
import com.teamates.repository.SessionRepository;
import com.teamates.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final SessionRepository sessionRepository;
    private final UserService userService;

    public Registration joinSession(User user, UUID sessionId) {

        if (!userService.isProfileComplete(user)) {
            throw new IllegalArgumentException(
                    "Please complete your profile before joining a session");
        }

        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));

        // check age eligibility
        int userAge = Period.between(user.getBirthDate(), LocalDate.now()).getYears();
        if (userAge < session.getAgeMin() || userAge > session.getAgeMax()) {
            throw new IllegalArgumentException(
                    "You don't meet the age requirement for this session (age " +
                            session.getAgeMin() + "–" + session.getAgeMax() + ")");
        }

        // check gender eligibility
        if (session.getGenderPreference() != null &&
                !session.getGenderPreference().equals(user.getGender().name())) {
            throw new IllegalArgumentException(
                    "This session is for " + session.getGenderPreference() + " players only");
        }

        // check if already registered
        if (registrationRepository.existsBySessionSessionIdAndUserUserId(
                sessionId, user.getUserId())) {
            throw new IllegalArgumentException("User already registered to this session");
        }


        Registration registration = new Registration();
        registration.setSession(session);
        registration.setUser(user);

        // check if session is full
        int affected = sessionRepository.incrementPlayerCount(sessionId);
        if (affected == 0) {
            throw new IllegalArgumentException("Session is full");
        }

        return registrationRepository.save(registration);
    }

    public void leaveSession(User user, UUID sessionId) {

        Registration registration = registrationRepository
                .findBySessionSessionIdAndUserUserId(sessionId, user.getUserId())
                .orElseThrow(() -> new NotFoundException("Registration not found"));

        registrationRepository.delete(registration);
        sessionRepository.decrementPlayerCount(sessionId);
    }

    public List<Registration> getSessionRegistrations(UUID sessionId) {
        return registrationRepository
                .findBySessionSessionIdOrderByRegisteredAtAsc(sessionId);
    }

    public int countPlayers(UUID sessionId) {
        return registrationRepository.countBySessionSessionId(sessionId);
    }
}