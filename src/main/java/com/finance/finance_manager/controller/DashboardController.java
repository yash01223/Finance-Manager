package com.finance.finance_manager.controller;

import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.service.FinancialRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.finance.finance_manager.entity.FinancialRecord;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
//description for API documentation
@Tag(name = "4. Dashboard (DashboardController)", description = "Endpoints for financial summaries and analytics")
public class DashboardController {

    private final FinancialRecordService financialRecordService;

    @GetMapping("/summary")
    @Operation(summary = "Get financial summary", description = "Retrieves total income, expenses, and balance summary.")
    public ResponseEntity<Map<String, Object>> getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(financialRecordService.getFinancialSummary(user, userId));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get category summary", description = "Retrieves a breakdown of expenses by category.")
    public ResponseEntity<List<Map<String, Object>>> getCategorySummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(financialRecordService.getCategorySummary(user, userId));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent activity", description = "Shows the last 10 financial transactions.")
    public ResponseEntity<List<FinancialRecord>> getRecentActivity(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(financialRecordService.getRecentActivity(user, userId));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get weekly trends", description = "Shows weekly income and expense totals for the last 8 weeks.")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyTrends(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(financialRecordService.getWeeklyTrends(user, userId));
    }
}
