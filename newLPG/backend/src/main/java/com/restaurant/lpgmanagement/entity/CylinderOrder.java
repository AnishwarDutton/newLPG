package com.restaurant.lpgmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cylinder_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CylinderOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne(optional = false)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne
    @JoinColumn(name = "cylinder_id")
    private Cylinder cylinder;

    @Positive
    @Column(nullable = false)
    private int quantity;

    private BigDecimal pricePerUnit;

    private BigDecimal totalAmount;

    @Column(nullable = false)
    private LocalDate orderDate;

    private LocalDate expectedDeliveryDate;

    private LocalDate deliveredDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum OrderStatus {
        PENDING, CONFIRMED, DISPATCHED, DELIVERED, CANCELLED
    }
}
