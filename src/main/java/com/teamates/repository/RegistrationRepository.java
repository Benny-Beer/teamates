package com.teamates.repository;

import com.teamates.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, UUID> {
    List<Registration> findBySessionSessionIdOrderByRegisteredAtAsc(UUID sessionId);
    Optional<Registration> findBySessionSessionIdAndUserUserId(UUID sessionId, UUID userId);
    boolean existsBySessionSessionIdAndUserUserId(UUID sessionId, UUID userId);
    int countBySessionSessionId(UUID sessionId);
}