package com.finance.finance_manager.dto;

import com.finance.finance_manager.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserFinancialSummaryDTO {
    private Long userId;
    private String username;
    private Role role;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netBalance;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private List<Map<String, Object>> categorySummary;
}
