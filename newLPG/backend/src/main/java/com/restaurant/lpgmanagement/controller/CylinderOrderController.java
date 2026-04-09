package com.restaurant.lpgmanagement.controller;

import com.restaurant.lpgmanagement.entity.*;
import com.restaurant.lpgmanagement.exception.*;
import com.restaurant.lpgmanagement.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class CylinderOrderController {

    private final CylinderOrderRepository orderRepo;
    private final RestaurantRepository restaurantRepo;
    private final SupplierRepository supplierRepo;
    private final CylinderRepository cylinderRepo;
    private final InventoryRepository inventoryRepo;

    @GetMapping
    public List<CylinderOrder> getAll() { return orderRepo.findAll(); }

    @GetMapping("/{id}")
    public CylinderOrder getById(@PathVariable Long id) {
        return orderRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    @GetMapping("/pending")
    public List<CylinderOrder> getPending() {
        return orderRepo.findByStatus(CylinderOrder.OrderStatus.PENDING);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<CylinderOrder> getByRestaurant(@PathVariable Long restaurantId) {
        Restaurant r = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", restaurantId));
        return orderRepo.findByRestaurantOrderByOrderDateDesc(r);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        BigDecimal monthSpend = orderRepo.sumTotalSpendByDateRange(monthStart, LocalDate.now());
        return Map.of(
                "pendingOrders", orderRepo.countPendingOrders(),
                "monthlySpend", monthSpend != null ? monthSpend : BigDecimal.ZERO
        );
    }

    @PostMapping
    public ResponseEntity<CylinderOrder> create(@Valid @RequestBody OrderRequest req) {
        Restaurant restaurant = restaurantRepo.findById(req.restaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", req.restaurantId()));
        Supplier supplier = supplierRepo.findById(req.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", req.supplierId()));
        Cylinder cylinder = req.cylinderId() != null
                ? cylinderRepo.findById(req.cylinderId()).orElse(null) : null;

        BigDecimal total = (req.pricePerUnit() != null && req.quantity() > 0)
                ? req.pricePerUnit().multiply(BigDecimal.valueOf(req.quantity())) : null;

        CylinderOrder order = CylinderOrder.builder()
                .restaurant(restaurant)
                .supplier(supplier)
                .cylinder(cylinder)
                .quantity(req.quantity())
                .pricePerUnit(req.pricePerUnit())
                .totalAmount(total)
                .orderDate(req.orderDate() != null ? req.orderDate() : LocalDate.now())
                .expectedDeliveryDate(req.expectedDeliveryDate())
                .status(CylinderOrder.OrderStatus.PENDING)
                .notes(req.notes())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(orderRepo.save(order));
    }

    @PatchMapping("/{id}/status")
    public CylinderOrder updateStatus(@PathVariable Long id, @RequestBody StatusUpdate req) {
        CylinderOrder order = orderRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        order.setStatus(req.status());
        if (req.status() == CylinderOrder.OrderStatus.DELIVERED) {
            order.setDeliveredDate(LocalDate.now());
            // Update inventory on delivery
            if (order.getCylinder() != null) {
                inventoryRepo.findByRestaurantAndCylinder(order.getRestaurant(), order.getCylinder())
                        .ifPresent(inv -> {
                            inv.setFullCylinders(inv.getFullCylinders() + order.getQuantity());
                            if (inv.getOnOrderCylinders() >= order.getQuantity())
                                inv.setOnOrderCylinders(inv.getOnOrderCylinders() - order.getQuantity());
                            inventoryRepo.save(inv);
                        });
            }
        }
        return orderRepo.save(order);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!orderRepo.existsById(id)) throw new ResourceNotFoundException("Order", id);
        orderRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record OrderRequest(Long restaurantId, Long supplierId, Long cylinderId,
                               @Positive int quantity, BigDecimal pricePerUnit,
                               LocalDate orderDate, LocalDate expectedDeliveryDate, String notes) {}
    public record StatusUpdate(CylinderOrder.OrderStatus status) {}
}
