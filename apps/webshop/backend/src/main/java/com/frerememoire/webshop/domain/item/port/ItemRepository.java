package com.frerememoire.webshop.domain.item.port;

import com.frerememoire.webshop.domain.item.Item;

import java.util.List;
import java.util.Optional;

public interface ItemRepository {

    List<Item> findAll();

    Optional<Item> findById(Long id);

    Item save(Item item);

    void deleteById(Long id);

    boolean existsById(Long id);
}
