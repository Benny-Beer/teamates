package com.teamates.repository;

import com.teamates.model.Session;
import com.teamates.model.SportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

// TODO: find sessions by location radius and sport type
// Parameters: lat, lng, radiusKm, sportType
@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {
    List<Session> findByHostUserId(UUID hostUserId);
    List<Session> findBySportType(SportType sportType);

}