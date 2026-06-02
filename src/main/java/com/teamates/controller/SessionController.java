package com.teamates.controller;

import com.teamates.model.Session;
import com.teamates.model.SportType;
import com.teamates.model.User;
import com.teamates.service.SessionService;
import com.teamates.service.UserService;
import com.teamates.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserService userService;



    @PostMapping
    public ResponseEntity<Session> createSession(@RequestBody CreateSessionRequest request) {
        User host = userService.getCurrentUser();

        Session session = sessionService.createSession(
                host,
                request.sportType(),
                request.title(),
                request.scheduledAt(),
                request.endTime(),
                request.googlePlaceId(),
                request.facilityName(),
                request.facilityAddress(),
                request.facilityLatitude(),
                request.facilityLongitude(),
                request.ageMin(),
                request.ageMax(),
                request.maxPlayers()
        );
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<Session> getSession(@PathVariable UUID sessionId) {
        Session session = sessionService.getSessionById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));
        return ResponseEntity.ok(session);
    }

    @GetMapping("/host/{hostUserId}")
    public ResponseEntity<List<Session>> getSessionsByHost(@PathVariable UUID hostUserId) {
        return ResponseEntity.ok(sessionService.getSessionsByHost(hostUserId));
    }

    @GetMapping("/sport/{sportType}")
    public ResponseEntity<List<Session>> getSessionsBySport(@PathVariable SportType sportType) {
        return ResponseEntity.ok(sessionService.getSessionsBySport(sportType));
    }



    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID sessionId) {
        User currentUser = userService.getCurrentUser();
        sessionService.deleteSession(sessionId, currentUser.getUserId());
        return ResponseEntity.noContent().build();
    }



    public record CreateSessionRequest(
            SportType sportType,
            String title,
            LocalDateTime scheduledAt,
            LocalDateTime endTime,
            String googlePlaceId,
            String facilityName,
            String facilityAddress,
            BigDecimal facilityLatitude,
            BigDecimal facilityLongitude,
            Integer ageMin,
            Integer ageMax,
            Integer maxPlayers
    ) {}


}