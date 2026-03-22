package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.stock.Stock;
import com.frerememoire.webshop.domain.stock.port.StockRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JpaStockRepository implements StockRepository {

    private final SpringDataStockRepository springDataRepository;

    public JpaStockRepository(SpringDataStockRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Stock save(Stock stock) {
        StockEntity entity = StockEntity.fromDomain(stock);
        StockEntity saved = springDataRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Stock> findById(Long id) {
        return springDataRepository.findById(id).map(StockEntity::toDomain);
    }

    @Override
    public List<Stock> findByItemId(Long itemId) {
        return springDataRepository.findByItemId(itemId).stream()
                .map(StockEntity::toDomain)
                .toList();
    }

    @Override
    public List<Stock> findAll() {
        return springDataRepository.findAll().stream()
                .map(StockEntity::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Long id) {
        springDataRepository.deleteById(id);
    }
}
