package com.restaurant.lpgmanagement.repository;

import com.restaurant.lpgmanagement.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByStatus(Supplier.SupplierStatus status);
    List<Supplier> findByCityIgnoreCase(String city);
}
