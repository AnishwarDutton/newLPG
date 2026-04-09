package com.restaurant.lpgmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Entity
@Table(name = "cylinders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cylinder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String type; // e.g. "Commercial 19kg", "Domestic 5kg"

    @Positive
    private double weightKg;

    private String brand;

    private String description;
}
