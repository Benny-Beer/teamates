package com.teamates.repository;

import com.teamates.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, UUID> {
    Optional<Facility> findByGooglePlaceId(String googlePlaceId);
}