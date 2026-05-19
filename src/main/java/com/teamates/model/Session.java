package com.teamates.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sessions")
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "session_id")
    private UUID sessionId;

    @ManyToOne
    @JoinColumn(name = "host_user_id", nullable = false)
    private User host;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false)
    private SportType sportType;

    @Column(nullable = false)
    private String title;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @ManyToOne
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(name = "age_min")
    private Integer ageMin;

    @Column(name = "age_max")
    private Integer ageMax;

    @Column(name = "gender_preference")
    private String genderPreference;

    @Column(name = "max_players", nullable = false)
    private Integer maxPlayers;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}