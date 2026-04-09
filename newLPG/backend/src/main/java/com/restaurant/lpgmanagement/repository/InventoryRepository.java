package com.restaurant.lpgmanagement.repository;

import com.restaurant.lpgmanagement.entity.Inventory;
import com.restaurant.lpgmanagement.entity.Restaurant;
import com.restaurant.lpgmanagement.entity.Cylinder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByRestaurant(Restaurant restaurant);
    Optional<Inventory> findByRestaurantAndCylinder(Restaurant restaurant, Cylinder cylinder);

    @Query("SELECT i FROM Inventory i WHERE i.fullCylinders <= i.minimumStockLevel")
    List<Inventory> findCriticalInventory();

    @Query("SELECT SUM(i.fullCylinders) FROM Inventory i")
    Long sumAllFullCylinders();

    @Query("SELECT SUM(i.emptyCylinders) FROM Inventory i")
    Long sumAllEmptyCylinders();
}
