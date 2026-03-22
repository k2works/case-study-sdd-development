package com.frerememoire.webshop.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface SpringDataStockRepository extends JpaRepository<StockEntity, Long> {

    List<StockEntity> findByItemId(Long itemId);

    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM StockEntity s "
            + "WHERE s.itemId = :itemId AND s.status <> 'EXPIRED'")
    int sumAvailableQuantityByItemId(@Param("itemId") Long itemId);

    @Query("SELECT COALESCE(SUM(s.quantity), 0) FROM StockEntity s "
            + "WHERE s.itemId = :itemId AND s.expiryDate = :date")
    int sumExpiringQuantityByItemIdAndDate(@Param("itemId") Long itemId,
                                           @Param("date") LocalDate date);

    @Query("SELECT s FROM StockEntity s "
            + "WHERE s.itemId = :itemId AND s.status = 'AVAILABLE' AND s.quantity > 0 "
            + "ORDER BY s.arrivedDate ASC")
    List<StockEntity> findAvailableByItemIdOrderByArrivedDate(@Param("itemId") Long itemId);
}
