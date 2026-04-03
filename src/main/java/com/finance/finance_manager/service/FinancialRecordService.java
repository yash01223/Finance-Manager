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
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialRecordService {

    private final FinancialRecordRepository financialRecordRepository;
    private final UserRepository userRepository;

    @Transactional
    public FinancialRecord createRecord(FinancialRecordDTO dto, User user) {
        if (user.getRole() == Role.ANALYST) {
            throw new AccessDeniedException("Analyst role is read-only and cannot create records.");
        }

        FinancialRecord record = FinancialRecord.builder()
                .amount(dto.getAmount())
                .type(dto.getType())
                .category(dto.getCategory())
                .date(dto.getDate())
                .notes(dto.getNotes())
                .user(user)
                .build();

        return financialRecordRepository.save(record);
    }

    public Page<FinancialRecord> getAllRecords(
            User user, TransactionType type, String category, String notes,
            LocalDate startDate, LocalDate endDate, Pageable pageable) {

        Long userId = user.getId();

        // If ANALYST or ADMIN, they can optionally see all records
        if (user.getRole() == Role.ANALYST || user.getRole() == Role.ADMIN) {
            userId = null; // Setting to null will fetch for all in findByCriteria
        }

        return financialRecordRepository.findByCriteria(userId, type, category, notes, startDate, endDate, pageable);
    }

    public FinancialRecord getRecordById(Long id, User user) {
        FinancialRecord record = financialRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Record not found"));

        // Only ADMIN/ANALYST or owner can view record
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
        record.setCategory(dto.getCategory());
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

    // Summary Logics for Dashboard
    public Map<String, Object> getFinancialSummary(User user) {
        Long userId = user.getId();
        // Analysts see summary for everyone (userId = null)
        if (user.getRole() == Role.ANALYST || user.getRole() == Role.ADMIN) {
             userId = null;
        }

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

    public List<Map<String, Object>> getCategorySummary(User user) {
        Long userId = user.getId();
        if (user.getRole() == Role.ANALYST || user.getRole() == Role.ADMIN) {
             userId = null;
        }
        return financialRecordRepository.sumByCategoryByUserId(userId);
    }

    public List<UserFinancialSummaryDTO> getUserFinancialSummaries(Role filterRole) {
        List<User> users = userRepository.findAll();
        
        if (filterRole != null) {
            users = users.stream().filter(u -> u.getRole() == filterRole).collect(Collectors.toList());
        }

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        return users.stream().map(u -> {
            BigDecimal totalIncome = financialRecordRepository.sumIncomeByUserId(u.getId());
            BigDecimal totalExpense = financialRecordRepository.sumExpenseByUserId(u.getId());
            BigDecimal monthlyIncome = financialRecordRepository.sumIncomeByUserIdInDateRange(u.getId(), startOfMonth, endOfMonth);
            BigDecimal monthlyExpense = financialRecordRepository.sumExpenseByUserIdInDateRange(u.getId(), startOfMonth, endOfMonth);
            List<Map<String, Object>> categories = financialRecordRepository.sumByCategoryByUserId(u.getId());

            totalIncome = totalIncome != null ? totalIncome : BigDecimal.ZERO;
            totalExpense = totalExpense != null ? totalExpense : BigDecimal.ZERO;
            monthlyIncome = monthlyIncome != null ? monthlyIncome : BigDecimal.ZERO;
            monthlyExpense = monthlyExpense != null ? monthlyExpense : BigDecimal.ZERO;

            return UserFinancialSummaryDTO.builder()
                    .username(u.getUsername())
                    .role(u.getRole())
                    .totalIncome(totalIncome)
                    .totalExpenses(totalExpense)
                    .netBalance(totalIncome.subtract(totalExpense))
                    .monthlyIncome(monthlyIncome)
                    .monthlyExpenses(monthlyExpense)
                    .categorySummary(categories)
                    .build();
        }).collect(Collectors.toList());
    }
}
