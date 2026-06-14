package com.teamates.controller;

import com.teamates.dto.FacilityMapper;
import com.teamates.dto.FacilityResponseDTO;
import com.teamates.model.SportType;
import com.teamates.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;
    private final FacilityMapper facilityMapper;

    @GetMapping("/search")
    public ResponseEntity<List<FacilityResponseDTO>> searchFacilities(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5000") double radius,
            @RequestParam SportType sport) {
        return ResponseEntity.ok(
                facilityService.searchNearby(lat, lng, radius, sport)
                        .stream()
                        .map(facilityMapper::toDto)
                        .toList()
        );
    }
}