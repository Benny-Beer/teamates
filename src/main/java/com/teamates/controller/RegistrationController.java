package com.teamates.controller;

import com.teamates.model.Registration;
import com.teamates.model.User;
import com.teamates.service.RegistrationService;
import com.teamates.service.SessionService;
import com.teamates.service.UserService;
import com.teamates.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationService registrationService;
    private final UserService userService;
    private final SessionService sessionService;

    @PostMapping("/{sessionId}/join")
    public ResponseEntity<Registration> joinSession(@PathVariable UUID sessionId) {
        User currentUser = userService.getCurrentUser();
        Registration registration = registrationService.joinSession(currentUser, sessionId);
        return ResponseEntity.ok(registration);
    }

    @DeleteMapping("/{sessionId}/leave")
    public ResponseEntity<Void> leaveSession(@PathVariable UUID sessionId) {
        User currentUser = userService.getCurrentUser();
        registrationService.leaveSession(currentUser, sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sessionId}/registrations")
    public ResponseEntity<List<Registration>> getRegistrations(
            @PathVariable UUID sessionId) {
        sessionService.getSessionById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));
        return ResponseEntity.ok(
                registrationService.getSessionRegistrations(sessionId));
    }
}