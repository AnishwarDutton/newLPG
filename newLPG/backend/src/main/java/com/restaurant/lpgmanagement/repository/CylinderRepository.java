package com.restaurant.lpgmanagement.repository;

import com.restaurant.lpgmanagement.entity.Cylinder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CylinderRepository extends JpaRepository<Cylinder, Long> {
    Optional<Cylinder> findByTypeIgnoreCase(String type);
    boolean existsByTypeIgnoreCase(String type);
}
