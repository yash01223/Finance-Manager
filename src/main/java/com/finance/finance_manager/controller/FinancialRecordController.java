package com.finance.finance_manager.controller;

import com.finance.finance_manager.dto.FinancialRecordDTO;
import com.finance.finance_manager.entity.FinancialRecord;
import com.finance.finance_manager.entity.TransactionType;
import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.service.FinancialRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class FinancialRecordController {

    private final FinancialRecordService financialRecordService;

    @PostMapping
    public ResponseEntity<FinancialRecord> createRecord(
            @Valid @RequestBody FinancialRecordDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.createRecord(dto, user));
    }

    @GetMapping
    public ResponseEntity<Page<FinancialRecord>> getRecords(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(financialRecordService.getAllRecords(user, type, category, notes, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinancialRecord> getRecordById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.getRecordById(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialRecord> updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody FinancialRecordDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.updateRecord(id, dto, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        financialRecordService.deleteRecord(id, user);
        return ResponseEntity.noContent().build();
    }
}
