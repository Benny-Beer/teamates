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

// TODO: find sessions by location radius and sport type
// Parameters: lat, lng, radiusKm, sportType
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

}

