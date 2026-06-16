package com.teamates.controller;

import com.teamates.model.Session;
import com.teamates.model.SportType;
import com.teamates.model.User;
import com.teamates.service.SessionService;
import com.teamates.service.UserService;
import com.teamates.dto.SessionMapper;
import com.teamates.dto.SessionResponseDTO;
import com.teamates.service.RegistrationService;
import com.teamates.exception.NotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;
    private final UserService userService;
    private final SessionMapper sessionMapper;
    private final RegistrationService registrationService;



    @PostMapping
    public ResponseEntity<SessionResponseDTO> createSession(@Valid @RequestBody CreateSessionRequest request) {
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
        int currentPlayers = registrationService.countPlayers(session.getSessionId());
        return ResponseEntity.ok(sessionMapper.toDto(session, currentPlayers));
    }

    @GetMapping("/my")
    public ResponseEntity<List<SessionResponseDTO>> getMySessions(
            @RequestParam(required = false) String role) {
        User currentUser = userService.getCurrentUser();
        return ResponseEntity.ok(
                sessionService.getSessionsForUser(currentUser.getUserId(), role)
                        .stream()
                        .map(s -> sessionMapper.toDto(s, registrationService.countPlayers(s.getSessionId())))
                        .toList()
        );
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<SessionResponseDTO>  getSession(@PathVariable UUID sessionId) {
        Session session = sessionService.getSessionById(sessionId)
                .orElseThrow(() -> new NotFoundException("Session not found"));
        int currentPlayers = registrationService.countPlayers(session.getSessionId());
        return ResponseEntity.ok(sessionMapper.toDto(session, currentPlayers));
    }

    @GetMapping("/sport/{sportType}")
    public ResponseEntity<List<SessionResponseDTO>> getSessionsBySport(@PathVariable SportType sportType) {
        return ResponseEntity.ok(
                sessionService.getSessionsBySport(sportType)
                        .stream()
                        .map(s -> sessionMapper.toDto(s, registrationService.countPlayers(s.getSessionId())))
                        .toList()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<SessionResponseDTO>> searchSessions(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5000") double radius,
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) Integer ageMin,
            @RequestParam(required = false) Integer ageMax,
            @RequestParam(required = false) String gender) {
        return ResponseEntity.ok(
                sessionService.searchSessions(lat, lng, radius, sport, ageMin, ageMax, gender)
                        .stream()
                        .map(s -> sessionMapper.toDto(s,
                                registrationService.countPlayers(s.getSessionId())))
                        .toList()
        );
    }

    @PatchMapping("/{sessionId}")
    public ResponseEntity<SessionResponseDTO> patchSession(
            @PathVariable UUID sessionId,
            @RequestBody PatchSessionRequest request) {
        User currentUser = userService.getCurrentUser();
        Session session = sessionService.patchSession(
                sessionId,
                currentUser.getUserId(),
                request.title(),
                request.scheduledAt(),
                request.endTime(),
                request.ageMin(),
                request.ageMax(),
                request.maxPlayers(),
                request.genderPreference()
        );
        int currentPlayers = registrationService.countPlayers(session.getSessionId());
        return ResponseEntity.ok(sessionMapper.toDto(session, currentPlayers));
    }

    public record PatchSessionRequest(
            String title,
            LocalDateTime scheduledAt,
            LocalDateTime endTime,
            Integer ageMin,
            Integer ageMax,
            Integer maxPlayers,
            String genderPreference
    ) {}



    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID sessionId) {
        User currentUser = userService.getCurrentUser();
        sessionService.deleteSession(sessionId, currentUser.getUserId());
        return ResponseEntity.noContent().build();
    }



    public record CreateSessionRequest(
            @NotNull(message = "Sport type is required")
            SportType sportType,

            @Size(max = 100, message = "Title must be under 100 characters")
            String title,

            @NotNull(message = "Start time is required")
            @Future(message = "Session must be scheduled in the future")
            LocalDateTime scheduledAt,

            @NotNull(message = "End time is required")
            @Future(message = "End time must be in the future")
            LocalDateTime endTime,

            @NotNull(message = "Facility name is required")
            @NotBlank(message = "Facility name cannot be blank")
            String facilityName,

            @NotNull(message = "Facility address is required")
            @NotBlank(message = "Facility address cannot be blank")
            String facilityAddress,

            @NotNull(message = "Google Place ID is required")
            @NotBlank(message = "Google Place ID cannot be blank")
            String googlePlaceId,

            @NotNull(message = "Latitude is required")
            BigDecimal facilityLatitude,

            @NotNull(message = "Longitude is required")
            BigDecimal facilityLongitude,

            @NotNull(message = "Minimum age is required")
            @Min(value = 15, message = "Minimum age is 15")
            @Max(value = 99, message = "Maximum age is 99")
            Integer ageMin,

            @NotNull(message = "Maximum age is required")
            @Min(value = 15, message = "Minimum age is 15")
            @Max(value = 99, message = "Maximum age is 99")
            Integer ageMax,

            @NotNull(message = "Max players is required")
            @Min(value = 2, message = "At least 2 players required")
            @Max(value = 15, message = "Maximum 15 players allowed")
            Integer maxPlayers
    ) {}


}