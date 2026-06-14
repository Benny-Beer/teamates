package com.teamates.dto;

import com.teamates.model.Facility;
import org.springframework.stereotype.Component;

@Component
public class FacilityMapper {

    public FacilityResponseDTO toDto(Facility facility) {
        return new FacilityResponseDTO(
                facility.getFacilityId(),
                facility.getGooglePlaceId(),
                facility.getName(),
                facility.getAddress(),
                facility.getLocation().getY(),  // latitude = Y
                facility.getLocation().getX()   // longitude = X
        );
    }
}