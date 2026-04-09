package com.restaurant.lpgmanagement.controller;

import com.restaurant.lpgmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final RestaurantRepository restaurantRepo;
    private final InventoryRepository inventoryRepo;
    private final CylinderOrderRepository orderRepo;
    private final GasUsageRepository usageRepo;

    @GetMapping("/kpis")
    public Map<String, Object> getKpis() {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate weekStart = LocalDate.now().minusDays(7);

        long totalRestaurants = restaurantRepo.count();
        long activeRestaurants = restaurantRepo.findByStatus(
                com.restaurant.lpgmanagement.entity.Restaurant.RestaurantStatus.ACTIVE).size();
        long criticalCount = inventoryRepo.findCriticalInventory().size();
        long fullCylinders = inventoryRepo.sumAllFullCylinders() != null
                ? inventoryRepo.sumAllFullCylinders() : 0;
        long pendingOrders = orderRepo.countPendingOrders();
        Long weekUsage = usageRepo.sumUsageByDateRange(weekStart, LocalDate.now());
        Long monthUsage = usageRepo.sumUsageByDateRange(monthStart, LocalDate.now());
        BigDecimal monthSpend = orderRepo.sumTotalSpendByDateRange(monthStart, LocalDate.now());

        return Map.of(
                "totalRestaurants", totalRestaurants,
                "activeRestaurants", activeRestaurants,
                "criticalStockCount", criticalCount,
                "totalFullCylinders", fullCylinders,
                "pendingOrders", pendingOrders,
                "weeklyGasUsage", weekUsage != null ? weekUsage : 0,
                "monthlyGasUsage", monthUsage != null ? monthUsage : 0,
                "monthlySpend", monthSpend != null ? monthSpend : BigDecimal.ZERO
        );
    }

    @GetMapping("/monthly-trend")
    public List<Map<String, Object>> getMonthlyTrend() {
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        List<Object[]> raw = usageRepo.getMonthlyUsageSummary(sixMonthsAgo);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            result.add(Map.of("month", row[0].toString().substring(0, 7), "total", row[1]));
        }
        return result;
    }
}
