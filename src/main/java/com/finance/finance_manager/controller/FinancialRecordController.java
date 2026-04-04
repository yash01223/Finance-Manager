package com.finance.finance_manager.controller;

import com.finance.finance_manager.dto.FinancialRecordDTO;
import com.finance.finance_manager.dto.UserFinancialSummaryDTO;
import com.finance.finance_manager.entity.FinancialRecord;
import com.finance.finance_manager.entity.Role;
import com.finance.finance_manager.entity.TransactionType;
import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.service.FinancialRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
@Tag(name = "Financial Record Management", description = "Endpoints for creating, reading, updating, and deleting financial records")
public class FinancialRecordController {

    private final FinancialRecordService financialRecordService;

    @Operation(summary = "Create a new financial record", description = "Adds a new income or expense entry for the authenticated user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Record created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized access")
    })
    @PostMapping
    public ResponseEntity<FinancialRecord> createRecord(
            @Valid @RequestBody FinancialRecordDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.createRecord(dto, user));
    }

    @Operation(summary = "Get paginated financial records", description = "Retrieves financial records with optional filtering by user ID, transaction type, category, and notes.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved records"),
            @ApiResponse(responseCode = "401", description = "Unauthorized access"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Access denied to other user's records")
    })
    @GetMapping
    public ResponseEntity<Page<FinancialRecord>> getRecords(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String notes,
            Pageable pageable) {
        return ResponseEntity.ok(financialRecordService.getAllRecords(user, userId, type, category, notes, pageable));
    }

    @Operation(summary = "Get a financial record by ID", description = "Retrieves a specific financial record if owned by the user or if the user is an admin.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the record"),
            @ApiResponse(responseCode = "404", description = "Record not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - No access to this record")
    })
    @GetMapping("/{id}")
    public ResponseEntity<FinancialRecord> getRecordById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.getRecordById(id, user));
    }

    @Operation(summary = "Update an existing financial record", description = "Modifies an existing record by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Record updated successfully"),
            @ApiResponse(responseCode = "404", description = "Record not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - No access to update this record")
    })
    @PutMapping("/{id}")
    public ResponseEntity<FinancialRecord> updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody FinancialRecordDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(financialRecordService.updateRecord(id, dto, user));
    }

    @Operation(summary = "Delete a financial record", description = "Deletes a specific record by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Record not found"),
            @ApiResponse(responseCode = "403", description = "Forbidden - No access to delete this record")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        financialRecordService.deleteRecord(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user-summaries")
    public ResponseEntity<List<UserFinancialSummaryDTO>> getUserSummaries(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Role role) {
        if (user.getRole() != Role.ADMIN && user.getRole() != Role.ANALYST) {
            throw new AccessDeniedException("Access denied.");
        }
        return ResponseEntity.ok(financialRecordService.getUserFinancialSummaries(role));
    }
}
