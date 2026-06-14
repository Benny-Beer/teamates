package com.teamates.service;

import com.teamates.model.Facility;
import com.teamates.model.FacilitySport;
import com.teamates.model.SportType;
import com.teamates.repository.FacilityRepository;
import com.teamates.repository.FacilitySportRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private static final int MIN_RESULTS = 10;

    private final FacilityRepository facilityRepository;
    private final FacilitySportRepository facilitySportRepository;
    private final GooglePlacesClient googlePlacesClient;

    public List<Facility> searchNearby(double lat, double lng, double radiusMeters, SportType sportType) {
        List<Facility> dbResults = facilityRepository
                .findFacilitiesWithinRadiusAndSport(lat, lng, radiusMeters, sportType.name());

        if (dbResults.size() >= MIN_RESULTS) {
            return dbResults;
        }

        // not enough — fall back to Google Places
        List<GooglePlaceResult> googleResults = googlePlacesClient
                .searchNearby(lat, lng, radiusMeters, sportType);

        for (GooglePlaceResult result : googleResults) {
            Facility facility = facilityRepository.findByGooglePlaceId(result.googlePlaceId())
                    .orElseGet(() -> createFacility(result));

            ensureFacilityHasSport(facility, sportType);
        }

        // re-query DB — now includes newly cached facilities
        return facilityRepository.findFacilitiesWithinRadiusAndSport(lat, lng, radiusMeters, sportType.name());
    }

    private Facility createFacility(GooglePlaceResult result) {
        GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        Point location = geometryFactory.createPoint(
                new Coordinate(result.longitude(), result.latitude())
        );
        location.setSRID(4326);

        Facility facility = new Facility();
        facility.setGooglePlaceId(result.googlePlaceId());
        facility.setName(result.name());
        facility.setAddress(result.address());
        facility.setLocation(location);
        return facilityRepository.save(facility);
    }

    private void ensureFacilityHasSport(Facility facility, SportType sportType) {
        boolean alreadyLinked = facilitySportRepository
                .existsByFacilityFacilityIdAndSportType(facility.getFacilityId(), sportType);

        if (!alreadyLinked) {
            FacilitySport link = new FacilitySport();
            link.setFacility(facility);
            link.setSportType(sportType);
            facilitySportRepository.save(link);
        }
    }
}