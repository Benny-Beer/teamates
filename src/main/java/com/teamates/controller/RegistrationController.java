package com.teamates.controller;

import com.teamates.model.Registration;
import com.teamates.model.User;
import com.teamates.service.RegistrationService;
import com.teamates.service.UserService;
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

    @PostMapping("/{sessionId}/join")
    public ResponseEntity<Registration> joinSession(
            @PathVariable UUID sessionId,
            @RequestBody JoinRequest request) {

        User user = userService.getUserById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Registration registration = registrationService.joinSession(user, sessionId);
        return ResponseEntity.ok(registration);
    }

    @DeleteMapping("/{sessionId}/leave")
    public ResponseEntity<Void> leaveSession(
            @PathVariable UUID sessionId,
            @RequestBody LeaveRequest request) {

        User user = userService.getUserById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        registrationService.leaveSession(user, sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{sessionId}/registrations")
    public ResponseEntity<List<Registration>> getRegistrations(
            @PathVariable UUID sessionId) {
        return ResponseEntity.ok(
                registrationService.getSessionRegistrations(sessionId));
    }

    public record JoinRequest(UUID userId) {}
    public record LeaveRequest(UUID userId) {}
}