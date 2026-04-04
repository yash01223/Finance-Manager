package com.finance.finance_manager.service;

import com.finance.finance_manager.dto.FinancialRecordDTO;
import com.finance.finance_manager.dto.UserFinancialSummaryDTO;
import com.finance.finance_manager.entity.FinancialRecord;
import com.finance.finance_manager.entity.Role;
import com.finance.finance_manager.entity.TransactionType;
import com.finance.finance_manager.entity.User;
import com.finance.finance_manager.repository.FinancialRecordRepository;
import com.finance.finance_manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialRecordService {

    private final FinancialRecordRepository financialRecordRepository;
    private final UserRepository userRepository;

    private static final List<String> FIXED_CATEGORIES = Arrays.asList("Salary", "Rent", "Travel", "Food", "other");

    @Transactional
    public FinancialRecord createRecord(FinancialRecordDTO dto, User user) {
        if (user.getRole() == Role.VIEWER) {
            throw new AccessDeniedException("Viewer role is read-only and cannot create records.");
        }

        String normalizedCategory = normalizeCategory(dto.getCategory());

        FinancialRecord record = FinancialRecord.builder()
                .amount(dto.getAmount())
                .type(dto.getType())
                .category(normalizedCategory)
                .date(dto.getDate())
                .notes(dto.getNotes())
                .user(user)
                .build();

        return financialRecordRepository.save(record);
    }

    private String normalizeCategory(String category) {
        if (category == null) return "other";
        String trimmed = category.trim();
        for (String fixed : FIXED_CATEGORIES) {
            if (fixed.equalsIgnoreCase(trimmed)) {
                return fixed;
            }
        }
        return "other";
    }

    public Page<FinancialRecord> getAllRecords(
            User user, Long targetUserId, TransactionType type, String category, String notes,
            Pageable pageable) {

        if (user.getRole() == Role.VIEWER) {
            throw new AccessDeniedException("Viewers can only access dashboard analytics.");
        }

        Long userId = user.getId();

        if (user.getRole() == Role.ANALYST || user.getRole() == Role.ADMIN) {
            userId = targetUserId;
        }

        return financialRecordRepository.findByCriteria(userId, type, category, notes, pageable);
    }

    public FinancialRecord getRecordById(Long id, User user) {
        FinancialRecord record = financialRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        if (user.getRole() != Role.ADMIN && user.getRole() != Role.ANALYST && !record.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied to this record.");
        }
        return record;
    }
    
    @Transactional
    public FinancialRecord updateRecord(Long id, FinancialRecordDTO dto, User user) {
        if (user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Admins can update records.");
        }

        FinancialRecord record = financialRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        record.setAmount(dto.getAmount());
        record.setType(dto.getType());
        record.setCategory(normalizeCategory(dto.getCategory()));
        record.setDate(dto.getDate());
        record.setNotes(dto.getNotes());

        return financialRecordRepository.save(record);
    }

    @Transactional
    public void deleteRecord(Long id, User user) {
        if (user.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only Admins can delete records.");
        }

        FinancialRecord record = financialRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        financialRecordRepository.delete(record);
    }

    public Map<String, Object> getFinancialSummary(User user, Long targetUserId) {
        Long userId = targetUserId;

        BigDecimal totalIncome = financialRecordRepository.sumIncomeByUserId(userId);
        BigDecimal totalExpense = financialRecordRepository.sumExpenseByUserId(userId);
        
        totalIncome = totalIncome != null ? totalIncome : BigDecimal.ZERO;
        totalExpense = totalExpense != null ? totalExpense : BigDecimal.ZERO;
        
        BigDecimal balance = totalIncome.subtract(totalExpense);

        return Map.of(
                "totalIncome", totalIncome,
                "totalExpenses", totalExpense,
                "netBalance", balance,
                "currency", "INR"
        );
    }

    public List<Map<String, Object>> getCategorySummary(User user, Long targetUserId) {
        Long userId = targetUserId;
        return financialRecordRepository.sumByCategoryByUserId(userId);
    }

    public List<UserFinancialSummaryDTO> getUserFinancialSummaries(Role filterRole) {
        List<User> users = userRepository.findAll();
        
        if (filterRole != null) {
            users = users.stream().filter(u -> u.getRole() == filterRole).collect(Collectors.toList());
        }

        return users.stream().map(u -> {
            return UserFinancialSummaryDTO.builder()
                    .userId(u.getId())
                    .username(u.getUsername())
                    .role(u.getRole())
                    .build();
        }).collect(Collectors.toList());
    }
}
