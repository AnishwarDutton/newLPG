package com.restaurant.lpgmanagement.controller;

import com.restaurant.lpgmanagement.entity.Cylinder;
import com.restaurant.lpgmanagement.exception.*;
import com.restaurant.lpgmanagement.repository.CylinderRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cylinders")
@RequiredArgsConstructor
public class CylinderController {

    private final CylinderRepository repo;

    @GetMapping
    public List<Cylinder> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Cylinder getById(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Cylinder", id));
    }

    @PostMapping
    public ResponseEntity<Cylinder> create(@Valid @RequestBody Cylinder cylinder) {
        if (repo.existsByTypeIgnoreCase(cylinder.getType()))
            throw new BusinessException("Cylinder type already exists: " + cylinder.getType());
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(cylinder));
    }

    @PutMapping("/{id}")
    public Cylinder update(@PathVariable Long id, @Valid @RequestBody Cylinder updated) {
        Cylinder existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cylinder", id));
        existing.setType(updated.getType());
        existing.setWeightKg(updated.getWeightKg());
        existing.setBrand(updated.getBrand());
        existing.setDescription(updated.getDescription());
        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Cylinder", id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
