package com.teamates.repository;

import com.teamates.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, UUID> {

    Optional<Facility> findByGooglePlaceId(String googlePlaceId);

    @Query(value = """
        SELECT * FROM facilities
        WHERE ST_DWithin(
            location::geography,
            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
            :radiusMeters
        )
        """, nativeQuery = true)
    List<Facility> findFacilitiesWithinRadius(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters
    );


    @Query(value = """
    SELECT f.* FROM facilities f
    JOIN facility_sports fs ON f.facility_id = fs.facility_id
    WHERE ST_DWithin(
        f.location::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radiusMeters
    )
    AND fs.sport_type = :sportType
    """, nativeQuery = true)
    List<Facility> findFacilitiesWithinRadiusAndSport(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters,
            @Param("sportType") String sportType
    );
}