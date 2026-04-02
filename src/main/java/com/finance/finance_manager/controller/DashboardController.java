package com.finance.finance_manager.controller;

import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.service.FinancialRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final FinancialRecordService financialRecordService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.getFinancialSummary(user));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategorySummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.getCategorySummary(user));
    }
}
