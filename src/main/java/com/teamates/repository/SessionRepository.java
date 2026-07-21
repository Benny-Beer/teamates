package com.teamates.repository;

import com.teamates.model.Session;
import com.teamates.model.SportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    List<Session> findByHostUserId(UUID hostUserId);

    List<Session> findBySportType(SportType sportType);

    @Query("SELECT COUNT(s) > 0 FROM Session s WHERE s.host.userId = :hostId AND s.scheduledAt < :endTime AND s.endTime > :scheduledAt")
    boolean existsOverlappingSessionForHost(
            @Param("hostId") UUID hostId,
            @Param("scheduledAt") LocalDateTime scheduledAt,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT COUNT(s) > 0 FROM Session s WHERE s.facility.facilityId = :facilityId AND s.scheduledAt < :endTime AND s.endTime > :scheduledAt")
    boolean existsOverlappingSessionForFacility(
            @Param("facilityId") UUID facilityId,
            @Param("scheduledAt") LocalDateTime scheduledAt,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("SELECT s FROM Session s JOIN Registration r ON r.session = s WHERE r.user.userId = :userId AND s.host.userId != :userId")
    List<Session> findSessionsWhereUserIsPlayer(@Param("userId") UUID userId);

    @Query("SELECT s FROM Session s JOIN Registration r ON r.session = s WHERE r.user.userId = :userId")
    List<Session> findAllSessionsForUser(@Param("userId") UUID userId);

    @Query(value = """
    SELECT DISTINCT s.* FROM sessions s
    JOIN facilities f ON s.facility_id = f.facility_id
    WHERE ST_DWithin(
        f.location::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radiusMeters
    )
    AND s.scheduled_at > NOW()
    AND s.scheduled_at < :maxDate
    AND (:sport IS NULL OR s.sport_type = :sport)
    AND (:userAge IS NULL OR (s.age_min <= :userAge AND s.age_max >= :userAge))
    AND (:gender IS NULL OR s.gender_preference IS NULL OR s.gender_preference = :gender)
    AND (
        SELECT COUNT(*) FROM registrations r
        WHERE r.session_id = s.session_id
    ) < s.max_players
    """, nativeQuery = true)
    List<Session> searchSessions(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters,
            @Param("sport") String sport,
            @Param("userAge") Integer userAge,
            @Param("gender") String gender,
            @Param("maxDate") java.time.LocalDateTime maxDate
    );

    @Modifying
    @Transactional
    @Query(value = """
    UPDATE sessions
    SET current_players = current_players + 1
    WHERE session_id = :sessionId
    AND current_players < max_players
    """, nativeQuery = true)
    int incrementPlayerCount(@Param("sessionId") UUID sessionId);

    @Modifying
    @Transactional
    @Query(value = """
    UPDATE sessions
    SET current_players = current_players - 1
    WHERE session_id = :sessionId
    AND current_players > 0
    """, nativeQuery = true)
    int decrementPlayerCount(@Param("sessionId") UUID sessionId);
}

