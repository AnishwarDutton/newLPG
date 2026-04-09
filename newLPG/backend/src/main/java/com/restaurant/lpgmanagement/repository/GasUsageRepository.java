package com.restaurant.lpgmanagement.repository;

import com.restaurant.lpgmanagement.entity.GasUsage;
import com.restaurant.lpgmanagement.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GasUsageRepository extends JpaRepository<GasUsage, Long> {
    List<GasUsage> findByRestaurantOrderByUsageDateDesc(Restaurant restaurant);

    @Query("SELECT g FROM GasUsage g WHERE g.usageDate BETWEEN :from AND :to ORDER BY g.usageDate DESC")
    List<GasUsage> findByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT g FROM GasUsage g WHERE g.restaurant = :restaurant AND g.usageDate BETWEEN :from AND :to")
    List<GasUsage> findByRestaurantAndDateRange(
        @Param("restaurant") Restaurant restaurant,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT SUM(g.cylindersUsed) FROM GasUsage g WHERE g.usageDate BETWEEN :from AND :to")
    Long sumUsageByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query(value = """
        SELECT DATE_TRUNC('month', g.usage_date) as month,
               SUM(g.cylinders_used) as total
        FROM gas_usage g
        WHERE g.usage_date >= :from
        GROUP BY DATE_TRUNC('month', g.usage_date)
        ORDER BY month
        """, nativeQuery = true)
    List<Object[]> getMonthlyUsageSummary(@Param("from") LocalDate from);
}
