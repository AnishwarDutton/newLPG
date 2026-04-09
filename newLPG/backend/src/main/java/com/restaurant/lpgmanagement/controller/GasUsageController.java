package com.restaurant.lpgmanagement.controller;

import com.restaurant.lpgmanagement.entity.*;
import com.restaurant.lpgmanagement.exception.*;
import com.restaurant.lpgmanagement.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/gas-usage")
@RequiredArgsConstructor
public class GasUsageController {

    private final GasUsageRepository usageRepo;
    private final RestaurantRepository restaurantRepo;
    private final CylinderRepository cylinderRepo;
    private final InventoryRepository inventoryRepo;

    @GetMapping
    public List<GasUsage> getAll() { return usageRepo.findAll(); }

    @GetMapping("/{id}")
    public GasUsage getById(@PathVariable Long id) {
        return usageRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("GasUsage", id));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<GasUsage> getByRestaurant(@PathVariable Long restaurantId) {
        Restaurant r = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", restaurantId));
        return usageRepo.findByRestaurantOrderByUsageDateDesc(r);
    }

    @GetMapping("/range")
    public List<GasUsage> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return usageRepo.findByDateRange(from, to);
    }

    @GetMapping("/monthly-summary")
    public List<Map<String, Object>> getMonthlySummary() {
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        List<Object[]> raw = usageRepo.getMonthlyUsageSummary(sixMonthsAgo);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            result.add(Map.of("month", row[0].toString(), "total", row[1]));
        }
        return result;
    }

    @PostMapping
    public ResponseEntity<GasUsage> create(@Valid @RequestBody UsageRequest req) {
        Restaurant restaurant = restaurantRepo.findById(req.restaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", req.restaurantId()));
        Cylinder cylinder = req.cylinderId() != null
                ? cylinderRepo.findById(req.cylinderId()).orElse(null) : null;

        // Deduct from inventory if cylinder is specified
        if (cylinder != null) {
            inventoryRepo.findByRestaurantAndCylinder(restaurant, cylinder).ifPresent(inv -> {
                if (inv.getFullCylinders() < req.cylindersUsed())
                    throw new BusinessException("Insufficient full cylinders in inventory");
                inv.setFullCylinders(inv.getFullCylinders() - req.cylindersUsed());
                inv.setEmptyCylinders(inv.getEmptyCylinders() + req.cylindersUsed());
                inventoryRepo.save(inv);
            });
        }

        GasUsage usage = GasUsage.builder()
                .restaurant(restaurant)
                .cylinder(cylinder)
                .cylindersUsed(req.cylindersUsed())
                .usageDate(req.usageDate() != null ? req.usageDate() : LocalDate.now())
                .mealPeriod(req.mealPeriod())
                .coversServed(req.coversServed())
                .notes(req.notes())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(usageRepo.save(usage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!usageRepo.existsById(id)) throw new ResourceNotFoundException("GasUsage", id);
        usageRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record UsageRequest(Long restaurantId, Long cylinderId,
                               int cylindersUsed, LocalDate usageDate,
                               GasUsage.MealPeriod mealPeriod, int coversServed, String notes) {}
}
