package com.restaurant.lpgmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gas_usage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GasUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "cylinder_id")
    private Cylinder cylinder;

    @Min(0)
    @Column(nullable = false)
    private int cylindersUsed;

    @NotNull
    @Column(nullable = false)
    private LocalDate usageDate;

    @Enumerated(EnumType.STRING)
    private MealPeriod mealPeriod;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private int coversServed; // number of guests

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime recordedAt;

    public enum MealPeriod {
        BREAKFAST, LUNCH, DINNER, ALL_DAY
    }
}
