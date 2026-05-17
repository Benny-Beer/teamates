package com.teamates.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_identities",
        uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_sub"}))
public class UserIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "identity_id")
    private UUID identityId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String provider;

    @Column(name = "provider_sub", nullable = false)
    private String providerSub;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}