package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class JpaItemRepository implements ItemRepository {

    private final SpringDataItemRepository springDataRepository;

    public JpaItemRepository(SpringDataItemRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public List<Item> findAll() {
        return springDataRepository.findAll().stream()
                .map(ItemEntity::toDomain)
                .toList();
    }

    @Override
    public Optional<Item> findById(Long id) {
        return springDataRepository.findById(id)
                .map(ItemEntity::toDomain);
    }

    @Override
    public Item save(Item item) {
        ItemEntity entity = ItemEntity.fromDomain(item);
        ItemEntity saved = springDataRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public void deleteById(Long id) {
        springDataRepository.deleteById(id);
    }

    @Override
    public boolean existsById(Long id) {
        return springDataRepository.existsById(id);
    }
}
