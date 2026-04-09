package com.restaurant.lpgmanagement.controller;

import com.restaurant.lpgmanagement.entity.Restaurant;
import com.restaurant.lpgmanagement.exception.ResourceNotFoundException;
import com.restaurant.lpgmanagement.repository.RestaurantRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantRepository repo;

    @GetMapping
    public List<Restaurant> getAll() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Restaurant getById(@PathVariable Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", id));
    }

    @GetMapping("/active")
    public List<Restaurant> getActive() {
        return repo.findByStatus(Restaurant.RestaurantStatus.ACTIVE);
    }

    @PostMapping
    public ResponseEntity<Restaurant> create(@Valid @RequestBody Restaurant restaurant) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(restaurant));
    }

    @PutMapping("/{id}")
    public Restaurant update(@PathVariable Long id, @Valid @RequestBody Restaurant updated) {
        Restaurant existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", id));
        existing.setName(updated.getName());
        existing.setCity(updated.getCity());
        existing.setAddress(updated.getAddress());
        existing.setOwnerName(updated.getOwnerName());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setLicenseNumber(updated.getLicenseNumber());
        existing.setStatus(updated.getStatus());
        existing.setNotes(updated.getNotes());
        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Restaurant", id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
