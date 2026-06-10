package com.teamates.service;

import com.teamates.model.Facility;
import com.teamates.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public List<Facility> searchNearby(double lat, double lng, double radiusMeters) {
        return facilityRepository.findFacilitiesWithinRadius(lat, lng, radiusMeters);
    }
}