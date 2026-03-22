package com.frerememoire.webshop.domain.stock.port;

import com.frerememoire.webshop.domain.stock.Stock;

import java.util.List;
import java.util.Optional;

public interface StockRepository {

    Stock save(Stock stock);

    Optional<Stock> findById(Long id);

    List<Stock> findByItemId(Long itemId);

    List<Stock> findAll();

    void deleteById(Long id);
}
