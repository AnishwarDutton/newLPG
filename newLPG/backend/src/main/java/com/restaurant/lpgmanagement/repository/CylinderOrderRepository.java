package com.restaurant.lpgmanagement.repository;

import com.restaurant.lpgmanagement.entity.CylinderOrder;
import com.restaurant.lpgmanagement.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CylinderOrderRepository extends JpaRepository<CylinderOrder, Long> {
    List<CylinderOrder> findByRestaurantOrderByOrderDateDesc(Restaurant restaurant);
    List<CylinderOrder> findByStatus(CylinderOrder.OrderStatus status);
    List<CylinderOrder> findByOrderDateBetweenOrderByOrderDateDesc(LocalDate from, LocalDate to);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM CylinderOrder o WHERE o.orderDate BETWEEN :from AND :to")
    BigDecimal sumTotalSpendByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COUNT(o) FROM CylinderOrder o WHERE o.status = 'PENDING'")
    long countPendingOrders();
}
