package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class JpaOrderRepository implements OrderRepository {

    private final SpringDataOrderRepository springDataRepository;

    public JpaOrderRepository(SpringDataOrderRepository springDataRepository) {
        this.springDataRepository = springDataRepository;
    }

    @Override
    public Order save(Order order) {
        OrderEntity entity = OrderEntity.fromDomain(order);
        OrderEntity saved = springDataRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Order> findById(Long id) {
        return springDataRepository.findById(id)
                .map(OrderEntity::toDomain);
    }

    @Override
    public List<Order> findByCustomerId(Long customerId) {
        return springDataRepository.findByCustomerId(customerId).stream()
                .map(OrderEntity::toDomain)
                .toList();
    }

    @Override
    public List<Order> findAll() {
        return springDataRepository.findAll().stream()
                .map(OrderEntity::toDomain)
                .toList();
    }

    @Override
    public List<Order> findByStatusAndDateRange(OrderStatus status, LocalDate from, LocalDate to) {
        return springDataRepository.findByStatusAndDeliveryDateBetween(status, from, to).stream()
                .map(OrderEntity::toDomain)
                .toList();
    }

    @Override
    public List<Order> findByDateRange(LocalDate from, LocalDate to) {
        return springDataRepository.findByDeliveryDateBetween(from, to).stream()
                .map(OrderEntity::toDomain)
                .toList();
    }
}
