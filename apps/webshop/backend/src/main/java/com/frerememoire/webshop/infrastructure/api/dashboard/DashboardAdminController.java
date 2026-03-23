package com.frerememoire.webshop.infrastructure.api.dashboard;

import com.frerememoire.webshop.application.dashboard.DashboardQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@Tag(name = "ダッシュボード", description = "管理者向けサマリー情報")
public class DashboardAdminController {

    private final DashboardQueryService dashboardQueryService;

    public DashboardAdminController(DashboardQueryService dashboardQueryService) {
        this.dashboardQueryService = dashboardQueryService;
    }

    @Operation(summary = "ダッシュボードサマリー", description = "本日の受注数・在庫アラート・出荷状況を取得する")
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        var summary = dashboardQueryService.getSummary();
        return ResponseEntity.ok(new DashboardSummaryResponse(
                summary.totalOrders(), summary.orderedCount(),
                summary.lowStockItems(), summary.outOfStockItems(),
                summary.bundlingCount(), summary.shippingCount()));
    }
}
