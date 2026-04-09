package com.restaurant.lpgmanagement.controller;

import com.restaurant.lpgmanagement.entity.Supplier;
import com.restaurant.lpgmanagement.exception.ResourceNotFoundException;
import com.restaurant.lpgmanagement.repository.SupplierRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository repo;

    @GetMapping
    public List<Supplier> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Supplier getById(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    @GetMapping("/active")
    public List<Supplier> getActive() {
        return repo.findByStatus(Supplier.SupplierStatus.ACTIVE);
    }

    @PostMapping
    public ResponseEntity<Supplier> create(@Valid @RequestBody Supplier supplier) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(supplier));
    }

    @PutMapping("/{id}")
    public Supplier update(@PathVariable Long id, @Valid @RequestBody Supplier updated) {
        Supplier existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        existing.setName(updated.getName());
        existing.setCity(updated.getCity());
        existing.setAddress(updated.getAddress());
        existing.setContact(updated.getContact());
        existing.setEmail(updated.getEmail());
        existing.setLicenseNumber(updated.getLicenseNumber());
        existing.setStatus(updated.getStatus());
        existing.setNotes(updated.getNotes());
        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Supplier", id);
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
