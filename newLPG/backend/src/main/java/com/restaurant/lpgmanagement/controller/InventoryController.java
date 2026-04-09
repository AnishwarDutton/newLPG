package com.restaurant.lpgmanagement.controller;

import com.restaurant.lpgmanagement.entity.*;
import com.restaurant.lpgmanagement.exception.*;
import com.restaurant.lpgmanagement.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryRepository inventoryRepo;
    private final RestaurantRepository restaurantRepo;
    private final CylinderRepository cylinderRepo;

    @GetMapping
    public List<Inventory> getAll() { return inventoryRepo.findAll(); }

    @GetMapping("/critical")
    public List<Inventory> getCritical() { return inventoryRepo.findCriticalInventory(); }

    @GetMapping("/restaurant/{restaurantId}")
    public List<Inventory> getByRestaurant(@PathVariable Long restaurantId) {
        Restaurant r = restaurantRepo.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", restaurantId));
        return inventoryRepo.findByRestaurant(r);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        long fullTotal = inventoryRepo.sumAllFullCylinders() != null ? inventoryRepo.sumAllFullCylinders() : 0;
        long emptyTotal = inventoryRepo.sumAllEmptyCylinders() != null ? inventoryRepo.sumAllEmptyCylinders() : 0;
        long criticalCount = inventoryRepo.findCriticalInventory().size();
        return Map.of(
                "totalFullCylinders", fullTotal,
                "totalEmptyCylinders", emptyTotal,
                "criticalCount", criticalCount
        );
    }

    @PostMapping
    public ResponseEntity<Inventory> create(@Valid @RequestBody InventoryRequest req) {
        Restaurant restaurant = restaurantRepo.findById(req.restaurantId())
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", req.restaurantId()));
        Cylinder cylinder = cylinderRepo.findById(req.cylinderId())
                .orElseThrow(() -> new ResourceNotFoundException("Cylinder", req.cylinderId()));

        inventoryRepo.findByRestaurantAndCylinder(restaurant, cylinder).ifPresent(i -> {
            throw new BusinessException("Inventory entry already exists for this restaurant + cylinder");
        });

        Inventory inv = Inventory.builder()
                .restaurant(restaurant)
                .cylinder(cylinder)
                .fullCylinders(req.fullCylinders())
                .emptyCylinders(req.emptyCylinders())
                .onOrderCylinders(req.onOrderCylinders())
                .minimumStockLevel(req.minimumStockLevel() > 0 ? req.minimumStockLevel() : 3)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryRepo.save(inv));
    }

    @PutMapping("/{id}")
    public Inventory update(@PathVariable Long id, @Valid @RequestBody InventoryRequest req) {
        Inventory inv = inventoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", id));
        inv.setFullCylinders(req.fullCylinders());
        inv.setEmptyCylinders(req.emptyCylinders());
        inv.setOnOrderCylinders(req.onOrderCylinders());
        if (req.minimumStockLevel() > 0) inv.setMinimumStockLevel(req.minimumStockLevel());
        return inventoryRepo.save(inv);
    }

    @PatchMapping("/{id}/adjust")
    public Inventory adjust(@PathVariable Long id, @RequestBody AdjustRequest req) {
        Inventory inv = inventoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", id));
        int newFull = inv.getFullCylinders() + req.fullDelta();
        int newEmpty = inv.getEmptyCylinders() + req.emptyDelta();
        if (newFull < 0) throw new BusinessException("Cannot reduce full cylinders below 0");
        if (newEmpty < 0) throw new BusinessException("Cannot reduce empty cylinders below 0");
        inv.setFullCylinders(newFull);
        inv.setEmptyCylinders(newEmpty);
        return inventoryRepo.save(inv);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!inventoryRepo.existsById(id)) throw new ResourceNotFoundException("Inventory", id);
        inventoryRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record InventoryRequest(Long restaurantId, Long cylinderId,
                                   int fullCylinders, int emptyCylinders,
                                   int onOrderCylinders, int minimumStockLevel) {}
    public record AdjustRequest(int fullDelta, int emptyDelta) {}
}
