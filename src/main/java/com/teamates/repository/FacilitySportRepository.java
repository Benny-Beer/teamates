package com.teamates.repository;

import com.teamates.model.FacilitySport;
import com.teamates.model.SportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface FacilitySportRepository extends JpaRepository<FacilitySport, UUID> {

    boolean existsByFacilityFacilityIdAndSportType(UUID facilityId, SportType sportType);
}