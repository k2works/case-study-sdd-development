package com.frerememoire.webshop.infrastructure.api.dashboard;

import com.frerememoire.webshop.application.dashboard.DashboardQueryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class DashboardAdminController {

    private final DashboardQueryService dashboardQueryService;

    public DashboardAdminController(DashboardQueryService dashboardQueryService) {
        this.dashboardQueryService = dashboardQueryService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        var summary = dashboardQueryService.getSummary();
        return ResponseEntity.ok(new DashboardSummaryResponse(
                summary.totalOrders(), summary.orderedCount()));
    }
}
