package com.finance.finance_manager.controller;

import com.finance.finance_manager.dto.FinancialRecordDTO;
import com.finance.finance_manager.dto.UserFinancialSummaryDTO;
import com.finance.finance_manager.entity.FinancialRecord;
import com.finance.finance_manager.entity.Role;
import com.finance.finance_manager.entity.TransactionType;
import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.service.FinancialRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
@Tag(name = "3. Financial Records (FinancialRecordController)", description = "Endpoints for managing income and expenses")
public class FinancialRecordController {

    private final FinancialRecordService financialRecordService;

    @PostMapping
    @Operation(summary = "Create a new financial record", description = "Adds a new income or expense record for the authenticated user.")
    public ResponseEntity<FinancialRecord> createRecord(
            @Valid @RequestBody FinancialRecordDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.createRecord(dto, user));
    }

    @GetMapping
    @Operation(summary = "Get list of financial records", description = "Retrieves a paginated list of financial records. Optionally filter by user, transaction type, category, and date range.")
    public ResponseEntity<Page<FinancialRecord>> getRecords(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(financialRecordService.getAllRecords(user, userId, type, category, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get record by ID", description = "Retrieves details of a specific financial record.")
    public ResponseEntity<FinancialRecord> getRecordById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.getRecordById(id, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update financial record", description = "Updates an existing financial record.")
    public ResponseEntity<FinancialRecord> updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody FinancialRecordDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.updateRecord(id, dto, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete financial record", description = "Deletes a specific financial record.")
    public ResponseEntity<Void> deleteRecord(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        financialRecordService.deleteRecord(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user-summaries")
    @Operation(summary = "Get user financial summaries", description = "Retrieves summaries of financial records for all users. Requires ADMIN or ANALYST role.")
    public ResponseEntity<List<UserFinancialSummaryDTO>> getUserSummaries(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Role role) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.ANALYST) {
            throw new AccessDeniedException("Access denied.");
        }
        return ResponseEntity.ok(financialRecordService.getUserFinancialSummaries(role));
    }
}
