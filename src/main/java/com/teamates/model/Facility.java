package com.teamates.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "facilities")
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "facility_id")
    private UUID facilityId;

    @Column(name = "google_place_id", unique = true, nullable = false)
    private String googlePlaceId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 9, scale = 6)
    private BigDecimal longitude;
}