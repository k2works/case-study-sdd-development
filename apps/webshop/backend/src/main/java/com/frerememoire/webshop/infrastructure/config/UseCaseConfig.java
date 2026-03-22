package com.frerememoire.webshop.infrastructure.config;

import com.frerememoire.webshop.application.bundling.BundlingQueryService;
import com.frerememoire.webshop.application.auth.AuthenticationUseCase;
import com.frerememoire.webshop.application.auth.RegistrationUseCase;
import com.frerememoire.webshop.application.item.ItemUseCase;
import com.frerememoire.webshop.application.order.OrderQueryService;
import com.frerememoire.webshop.application.order.PlaceOrderUseCase;
import com.frerememoire.webshop.application.product.ProductUseCase;
import com.frerememoire.webshop.application.purchaseorder.PlacePurchaseOrderUseCase;
import com.frerememoire.webshop.application.purchaseorder.PurchaseOrderQueryService;
import com.frerememoire.webshop.application.purchaseorder.RegisterArrivalUseCase;
import com.frerememoire.webshop.domain.purchaseorder.port.ArrivalRepository;
import com.frerememoire.webshop.application.stock.InventoryTransitionUseCase;
import com.frerememoire.webshop.domain.auth.PasswordEncoder;
import com.frerememoire.webshop.domain.auth.port.AuthUserRepository;
import com.frerememoire.webshop.domain.customer.port.CustomerRepository;
import com.frerememoire.webshop.domain.customer.port.DeliveryDestinationRepository;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.product.port.ProductRepository;
import com.frerememoire.webshop.domain.purchaseorder.port.PurchaseOrderRepository;
import com.frerememoire.webshop.domain.stock.InventoryTransitionService;
import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;
import com.frerememoire.webshop.domain.stock.port.StockRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class UseCaseConfig {

    @Bean
    public AuthenticationUseCase authenticationUseCase(
            AuthUserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return new AuthenticationUseCase(userRepository, passwordEncoder);
    }

    @Bean
    public RegistrationUseCase registrationUseCase(
            AuthUserRepository userRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder) {
        return new RegistrationUseCase(userRepository, customerRepository, passwordEncoder);
    }

    @Bean
    public ItemUseCase itemUseCase(ItemRepository itemRepository) {
        return new ItemUseCase(itemRepository);
    }

    @Bean
    public ProductUseCase productUseCase(ProductRepository productRepository, ItemRepository itemRepository) {
        return new ProductUseCase(productRepository, itemRepository);
    }

    @Bean
    public PlaceOrderUseCase placeOrderUseCase(OrderRepository orderRepository,
                                                CustomerRepository customerRepository,
                                                DeliveryDestinationRepository deliveryDestinationRepository,
                                                ProductRepository productRepository) {
        return new PlaceOrderUseCase(orderRepository, customerRepository,
                deliveryDestinationRepository, productRepository);
    }

    @Bean
    public OrderQueryService orderQueryService(OrderRepository orderRepository,
                                                CustomerRepository customerRepository) {
        return new OrderQueryService(orderRepository, customerRepository);
    }

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }

    @Bean
    public InventoryTransitionService inventoryTransitionService(Clock clock,
                                                                  InventoryQueryPort queryPort) {
        return new InventoryTransitionService(clock, queryPort);
    }

    @Bean
    public InventoryTransitionUseCase inventoryTransitionUseCase(
            InventoryTransitionService transitionService) {
        return new InventoryTransitionUseCase(transitionService);
    }

    @Bean
    public PlacePurchaseOrderUseCase placePurchaseOrderUseCase(
            PurchaseOrderRepository purchaseOrderRepository,
            ItemRepository itemRepository) {
        return new PlacePurchaseOrderUseCase(purchaseOrderRepository, itemRepository);
    }

    @Bean
    public PurchaseOrderQueryService purchaseOrderQueryService(
            PurchaseOrderRepository purchaseOrderRepository) {
        return new PurchaseOrderQueryService(purchaseOrderRepository);
    }

    @Bean
    public BundlingQueryService bundlingQueryService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            StockRepository stockRepository,
            ItemRepository itemRepository) {
        return new BundlingQueryService(orderRepository, productRepository, stockRepository, itemRepository);
    }

    @Bean
    public RegisterArrivalUseCase registerArrivalUseCase(
            PurchaseOrderRepository purchaseOrderRepository,
            ArrivalRepository arrivalRepository,
            ItemRepository itemRepository,
            StockRepository stockRepository) {
        return new RegisterArrivalUseCase(
                purchaseOrderRepository, arrivalRepository, itemRepository, stockRepository);
    }
}
