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

    // Pagination & Search support with Date filters
    @Query(value = "SELECT f FROM FinancialRecord f WHERE " +
            "(:userId IS NULL OR f.user.id = :userId) AND " +
            "(:type IS NULL OR f.type = :type) AND " +
            "(:category IS NULL OR :category = '' OR LOWER(f.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
            "(:startDate IS NULL OR f.date >= :startDate) AND " +
            "(:endDate IS NULL OR f.date <= :endDate)",
            countQuery = "SELECT COUNT(f) FROM FinancialRecord f WHERE " +
            "(:userId IS NULL OR f.user.id = :userId) AND " +
            "(:type IS NULL OR f.type = :type) AND " +
            "(:category IS NULL OR :category = '' OR LOWER(f.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
            "(:startDate IS NULL OR f.date >= :startDate) AND " +
            "(:endDate IS NULL OR f.date <= :endDate)")
    Page<FinancialRecord> findByCriteria(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("category") String category,
            @Param("startDate") java.time.LocalDate startDate,
            @Param("endDate") java.time.LocalDate endDate,
            Pageable pageable);

    // Summary Analytics
    @Query("SELECT SUM(f.amount) FROM FinancialRecord f WHERE (:userId IS NULL OR f.user.id = :userId) AND f.type = com.finance.finance_manager.entity.TransactionType.INCOME")
    BigDecimal sumIncomeByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(f.amount) FROM FinancialRecord f WHERE (:userId IS NULL OR f.user.id = :userId) AND f.type = com.finance.finance_manager.entity.TransactionType.EXPENSE")
    BigDecimal sumExpenseByUserId(@Param("userId") Long userId);

    @Query("SELECT f.category as category, SUM(f.amount) as total FROM FinancialRecord f WHERE (:userId IS NULL OR f.user.id = :userId) GROUP BY f.category")
    List<Map<String, Object>> sumByCategoryByUserId(@Param("userId") Long userId);

    // Recent Activity
    List<FinancialRecord> findTop10ByUser_IdOrderByDateDesc(Long userId);

    // Weekly Trends (Last few weeks) for both Income and Expenses
    @Query("SELECT EXTRACT(WEEK FROM f.date) as period, f.type as type, SUM(f.amount) as total " +
            "FROM FinancialRecord f " +
            "WHERE (:userId IS NULL OR f.user.id = :userId) " +
            "AND f.date >= :startDate " +
            "GROUP BY EXTRACT(WEEK FROM f.date), f.type " +
            "ORDER BY EXTRACT(WEEK FROM f.date) ASC")
    List<Map<String, Object>> sumWeeklyTrendsByUserId(@Param("userId") Long userId, @Param("startDate") java.time.LocalDate startDate);
}
