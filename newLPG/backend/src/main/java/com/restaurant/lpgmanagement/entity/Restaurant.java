package com.restaurant.lpgmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    private String city;

    private String address;

    @NotBlank
    private String ownerName;

    private String phone;

    @Email
    private String email;

    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestaurantStatus status = RestaurantStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum RestaurantStatus {
        ACTIVE, INACTIVE, SUSPENDED
    }
}
