package com.restaurant.lpgmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory",
       uniqueConstraints = @UniqueConstraint(columnNames = {"restaurant_id", "cylinder_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cylinder_id")
    private Cylinder cylinder;

    @Min(0)
    @Column(nullable = false)
    private int fullCylinders;

    @Min(0)
    @Column(nullable = false)
    private int emptyCylinders;

    @Min(0)
    private int onOrderCylinders;

    @Column(nullable = false)
    private int minimumStockLevel = 3;

    @UpdateTimestamp
    private LocalDateTime lastUpdated;

    public boolean isCritical() {
        return fullCylinders <= minimumStockLevel;
    }
}
