package com.finance.finance_manager.controller;

import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.service.FinancialRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard Management", description = "Endpoints for retrieving financial summary and category-wise statistics")
public class DashboardController {

    private final FinancialRecordService financialRecordService;

    @Operation(summary = "Get overall financial summary", description = "Retrieves total income, total expenses, and net balance. Optionally for a specific user if the requester is an admin.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved financial summary"),
            @ApiResponse(responseCode = "401", description = "Unauthorized access - JWT missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Access denied to user data")
    })
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(financialRecordService.getFinancialSummary(user, userId));
    }

    @Operation(summary = "Get category-wise financial summary", description = "Retrieves a breakdown of finances grouped by categories. Optionally for a specific user if the requester is an admin.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved category breakdown"),
            @ApiResponse(responseCode = "401", description = "Unauthorized access - JWT missing or invalid"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Access denied to user data")
    })
    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategorySummary(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(financialRecordService.getCategorySummary(user, userId));
    }
}
