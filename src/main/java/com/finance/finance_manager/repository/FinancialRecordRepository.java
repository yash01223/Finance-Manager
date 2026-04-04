package com.finance.finance_manager.repository;

import com.finance.finance_manager.entity.FinancialRecord;
import com.finance.finance_manager.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {

    // Pagination & Search support (Date filters removed)
    @Query(value = "SELECT f FROM FinancialRecord f WHERE " +
            "(:userId IS NULL OR f.user.id = :userId) AND " +
            "(:type IS NULL OR f.type = :type) AND " +
            "(:category IS NULL OR :category = '' OR LOWER(f.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
            "(:notes IS NULL OR :notes = '' OR LOWER(f.notes) LIKE LOWER(CONCAT('%', :notes, '%')))",
            countQuery = "SELECT COUNT(f) FROM FinancialRecord f WHERE " +
            "(:userId IS NULL OR f.user.id = :userId) AND " +
            "(:type IS NULL OR f.type = :type) AND " +
            "(:category IS NULL OR :category = '' OR LOWER(f.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
            "(:notes IS NULL OR :notes = '' OR LOWER(f.notes) LIKE LOWER(CONCAT('%', :notes, '%')))")
    Page<FinancialRecord> findByCriteria(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("category") String category,
            @Param("notes") String notes,
            Pageable pageable);

    // Summary Analytics
    @Query("SELECT SUM(f.amount) FROM FinancialRecord f WHERE (:userId IS NULL OR f.user.id = :userId) AND f.type = com.finance.finance_manager.entity.TransactionType.INCOME")
    BigDecimal sumIncomeByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(f.amount) FROM FinancialRecord f WHERE (:userId IS NULL OR f.user.id = :userId) AND f.type = com.finance.finance_manager.entity.TransactionType.EXPENSE")
    BigDecimal sumExpenseByUserId(@Param("userId") Long userId);

    @Query("SELECT f.category as category, SUM(f.amount) as total FROM FinancialRecord f WHERE (:userId IS NULL OR f.user.id = :userId) GROUP BY f.category")
    List<Map<String, Object>> sumByCategoryByUserId(@Param("userId") Long userId);
}
