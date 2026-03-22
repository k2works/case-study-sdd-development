package com.frerememoire.webshop.infrastructure.persistence;

import com.frerememoire.webshop.domain.auth.AuthUser;
import com.frerememoire.webshop.domain.auth.Role;
import com.frerememoire.webshop.domain.auth.UserProfile;
import com.frerememoire.webshop.domain.customer.Customer;
import com.frerememoire.webshop.domain.customer.DeliveryDestination;
import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.product.Product;
import com.frerememoire.webshop.domain.product.ProductComposition;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrder;
import com.frerememoire.webshop.domain.purchaseorder.PurchaseOrderStatus;
import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaInventoryQueryPort.class)
class JpaInventoryQueryPortTest {

    @Autowired
    private InventoryQueryPort inventoryQueryPort;

    @Autowired
    private SpringDataPurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private SpringDataOrderRepository orderRepository;

    @Autowired
    private SpringDataProductRepository productRepository;

    @Autowired
    private SpringDataItemRepository itemRepository;

    @Autowired
    private SpringDataUserRepository userRepository;

    @Autowired
    private SpringDataCustomerRepository customerRepository;

    @Autowired
    private SpringDataDeliveryDestinationRepository deliveryDestinationRepository;

    private static final LocalDate TARGET_DATE = LocalDate.of(2026, 4, 1);
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 3, 22, 10, 0);

    private Long itemId;
    private Long otherItemId;
    private Long customerId;
    private Long deliveryDestinationId;

    @BeforeEach
    void setUpMasterData() {
        // FK 制約を満たすためのマスターデータを作成
        ItemEntity item = itemRepository.save(ItemEntity.fromDomain(
                new Item(null, "テスト単品", 30, 10, 3, "テスト仕入先", NOW, NOW)));
        itemId = item.toDomain().getId();

        ItemEntity otherItem = itemRepository.save(ItemEntity.fromDomain(
                new Item(null, "別の単品", 30, 10, 3, "テスト仕入先", NOW, NOW)));
        otherItemId = otherItem.toDomain().getId();

        UserEntity user = userRepository.save(UserEntity.fromDomain(
                new AuthUser(null, "test@example.com", "encoded_pass", Role.CUSTOMER,
                        new UserProfile("太郎", "山田", null), 0, null, NOW, NOW)));

        CustomerEntity customer = customerRepository.save(CustomerEntity.fromDomain(
                new Customer(null, user.getId(), "テスト得意先", null, NOW, NOW)));
        customerId = customer.getId();

        DeliveryDestinationEntity dest = deliveryDestinationRepository.save(
                DeliveryDestinationEntity.fromDomain(
                        new DeliveryDestination(null, customerId, "テスト宛先",
                                "100-0001", "東京都千代田区", null, NOW)));
        deliveryDestinationId = dest.toDomain().getId();
    }

    @Nested
    class GetExpectedArrivals {

        @BeforeEach
        void setUp() {
            purchaseOrderRepository.deleteAll();
        }

        @Test
        void 発注データがない場合は0を返す() {
            int result = inventoryQueryPort.getExpectedArrivals(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(0);
        }

        @Test
        void ORDERED状態の発注の数量を合算して返す() {
            savePurchaseOrder(itemId, 10, TARGET_DATE, PurchaseOrderStatus.ORDERED);

            int result = inventoryQueryPort.getExpectedArrivals(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(10);
        }

        @Test
        void PARTIAL状態の発注も合算対象に含む() {
            savePurchaseOrder(itemId, 10, TARGET_DATE, PurchaseOrderStatus.ORDERED);
            savePurchaseOrder(itemId, 5, TARGET_DATE, PurchaseOrderStatus.PARTIAL);

            int result = inventoryQueryPort.getExpectedArrivals(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(15);
        }

        @Test
        void RECEIVED状態の発注は合算対象外() {
            savePurchaseOrder(itemId, 10, TARGET_DATE, PurchaseOrderStatus.ORDERED);
            savePurchaseOrder(itemId, 20, TARGET_DATE, PurchaseOrderStatus.RECEIVED);

            int result = inventoryQueryPort.getExpectedArrivals(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(10);
        }

        @Test
        void 異なる納品日の発注は合算対象外() {
            savePurchaseOrder(itemId, 10, TARGET_DATE, PurchaseOrderStatus.ORDERED);
            savePurchaseOrder(itemId, 20, TARGET_DATE.plusDays(1), PurchaseOrderStatus.ORDERED);

            int result = inventoryQueryPort.getExpectedArrivals(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(10);
        }

        @Test
        void 異なる単品IDの発注は合算対象外() {
            savePurchaseOrder(itemId, 10, TARGET_DATE, PurchaseOrderStatus.ORDERED);
            savePurchaseOrder(otherItemId, 20, TARGET_DATE, PurchaseOrderStatus.ORDERED);

            int result = inventoryQueryPort.getExpectedArrivals(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(10);
        }
    }

    @Nested
    class GetOrderAllocations {

        @BeforeEach
        void setUp() {
            orderRepository.deleteAll();
            productRepository.deleteAll();
        }

        @Test
        void 受注データがない場合は0を返す() {
            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(0);
        }

        @Test
        void ORDERED状態の受注から商品構成の数量を合算して返す() {
            ProductEntity product = saveProductWithComposition(itemId, 3);
            saveOrder(product.toDomain().getId(), TARGET_DATE, OrderStatus.ORDERED);

            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(3);
        }

        @Test
        void 複数の受注の商品構成を合算して返す() {
            ProductEntity product = saveProductWithComposition(itemId, 3);
            Long productId = product.toDomain().getId();
            saveOrder(productId, TARGET_DATE, OrderStatus.ORDERED);
            saveOrder(productId, TARGET_DATE, OrderStatus.ACCEPTED);

            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(6);
        }

        @Test
        void CANCELLED状態の受注は合算対象外() {
            ProductEntity product = saveProductWithComposition(itemId, 3);
            Long productId = product.toDomain().getId();
            saveOrder(productId, TARGET_DATE, OrderStatus.ORDERED);
            saveOrder(productId, TARGET_DATE, OrderStatus.CANCELLED);

            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(3);
        }

        @Test
        void SHIPPED状態の受注は合算対象外() {
            ProductEntity product = saveProductWithComposition(itemId, 3);
            Long productId = product.toDomain().getId();
            saveOrder(productId, TARGET_DATE, OrderStatus.ORDERED);
            saveOrder(productId, TARGET_DATE, OrderStatus.SHIPPED);

            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(3);
        }

        @Test
        void DELIVERED状態の受注は合算対象外() {
            ProductEntity product = saveProductWithComposition(itemId, 3);
            Long productId = product.toDomain().getId();
            saveOrder(productId, TARGET_DATE, OrderStatus.ORDERED);
            saveOrder(productId, TARGET_DATE, OrderStatus.DELIVERED);

            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(3);
        }

        @Test
        void PREPARING状態の受注は合算対象に含む() {
            ProductEntity product = saveProductWithComposition(itemId, 3);
            Long productId = product.toDomain().getId();
            saveOrder(productId, TARGET_DATE, OrderStatus.PREPARING);

            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(3);
        }

        @Test
        void 異なる届け日の受注は合算対象外() {
            ProductEntity product = saveProductWithComposition(itemId, 3);
            Long productId = product.toDomain().getId();
            saveOrder(productId, TARGET_DATE, OrderStatus.ORDERED);
            saveOrder(productId, TARGET_DATE.plusDays(1), OrderStatus.ORDERED);

            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(3);
        }

        @Test
        void 対象単品を含まない商品の受注は合算対象外() {
            ProductEntity product = saveProductWithComposition(otherItemId, 5);
            Long productId = product.toDomain().getId();
            saveOrder(productId, TARGET_DATE, OrderStatus.ORDERED);

            int result = inventoryQueryPort.getOrderAllocations(itemId, TARGET_DATE);

            assertThat(result).isEqualTo(0);
        }
    }

    // --- ヘルパーメソッド ---

    private void savePurchaseOrder(Long targetItemId, int quantity, LocalDate deliveryDate,
                                    PurchaseOrderStatus status) {
        PurchaseOrder po = new PurchaseOrder(null, targetItemId, "テスト仕入先", quantity,
                deliveryDate, status, NOW, NOW);
        purchaseOrderRepository.save(PurchaseOrderEntity.fromDomain(po));
    }

    private ProductEntity saveProductWithComposition(Long targetItemId, int quantity) {
        Product product = new Product(null, "テスト商品", 1000, "説明",
                true, List.of(new ProductComposition(null, targetItemId, quantity)),
                NOW, NOW);
        return productRepository.save(ProductEntity.fromDomain(product));
    }

    private void saveOrder(Long productId, LocalDate deliveryDate, OrderStatus status) {
        Order order = new Order(null, customerId, productId, deliveryDestinationId,
                DeliveryDate.reconstruct(deliveryDate),
                new Message(null),
                status, NOW, NOW);
        orderRepository.save(OrderEntity.fromDomain(order));
    }
}
