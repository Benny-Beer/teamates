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


        // check if already registered
        if (registrationRepository.existsBySessionSessionIdAndUserUserId(
                sessionId, user.getUserId())) {
            throw new IllegalArgumentException("User already registered to this session");
        }

        // check if session is full
        int currentPlayers = registrationRepository.countBySessionSessionId(sessionId);
        if (currentPlayers >= session.getMaxPlayers()) {
            throw new IllegalArgumentException("Session is full");
        }

        Registration registration = new Registration();
        registration.setSession(session);
        registration.setUser(user);

        return registrationRepository.save(registration);
    }

    public void leaveSession(User user, UUID sessionId) {

        Registration registration = registrationRepository
                .findBySessionSessionIdAndUserUserId(sessionId, user.getUserId())
                .orElseThrow(() -> new NotFoundException("Registration not found"));

        registrationRepository.delete(registration);
    }

    public List<Registration> getSessionRegistrations(UUID sessionId) {
        return registrationRepository
                .findBySessionSessionIdOrderByRegisteredAtAsc(sessionId);
    }
}