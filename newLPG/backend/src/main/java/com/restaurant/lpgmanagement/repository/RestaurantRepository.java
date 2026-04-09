package com.restaurant.lpgmanagement.repository;

import com.restaurant.lpgmanagement.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByStatus(Restaurant.RestaurantStatus status);
    List<Restaurant> findByCityIgnoreCase(String city);
    boolean existsByLicenseNumber(String licenseNumber);
}
