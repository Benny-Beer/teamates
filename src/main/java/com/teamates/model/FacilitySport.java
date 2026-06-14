package com.teamates.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "facility_sports",
        uniqueConstraints = @UniqueConstraint(columnNames = {"facility_id", "sport_type"}))
public class FacilitySport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "facility_sport_id")
    private UUID facilitySportId;

    @ManyToOne
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false)
    private SportType sportType;
}