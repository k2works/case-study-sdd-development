package com.frerememoire.webshop.application.dashboard;

import com.frerememoire.webshop.domain.item.Item;
import com.frerememoire.webshop.domain.item.port.ItemRepository;
import com.frerememoire.webshop.domain.order.DeliveryDate;
import com.frerememoire.webshop.domain.order.Message;
import com.frerememoire.webshop.domain.order.Order;
import com.frerememoire.webshop.domain.order.OrderStatus;
import com.frerememoire.webshop.domain.order.port.OrderRepository;
import com.frerememoire.webshop.domain.stock.port.InventoryQueryPort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardQueryServiceTest {

    private static final LocalDate FIXED_TODAY = LocalDate.of(2026, 3, 23);
    private static final Clock FIXED_CLOCK = Clock.fixed(
            FIXED_TODAY.atStartOfDay(ZoneId.systemDefault()).toInstant(),
            ZoneId.systemDefault());

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ItemRepository itemRepository;
    @Mock
    private InventoryQueryPort inventoryQueryPort;

    private DashboardQueryService service;

    @BeforeEach
    void setUp() {
        service = new DashboardQueryService(orderRepository, itemRepository, inventoryQueryPort, FIXED_CLOCK);
    }

    private Order createTestOrder(Long id, OrderStatus status) {
        return new Order(id, 1L, 1L, 1L,
                new DeliveryDate(FIXED_TODAY.plusDays(5)),
                new Message("テスト"), status,
                LocalDateTime.now(), LocalDateTime.now());
    }

    private Order createTestOrderForDate(Long id, OrderStatus status, LocalDate date) {
        return new Order(id, 1L, 1L, 1L,
                new DeliveryDate(date),
                new Message("テスト"), status,
                LocalDateTime.now(), LocalDateTime.now());
    }

    private Item createTestItem(Long id, String name, int purchaseUnit) {
        return new Item(id, name, 7, purchaseUnit, 3, "花材卸A社",
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Nested
    class OrderSummary {

        @Test
        void 受注が0件の場合は全カウントが0を返す() {
            when(orderRepository.findAll()).thenReturn(Collections.emptyList());
            when(itemRepository.findAll()).thenReturn(Collections.emptyList());
            when(orderRepository.findByDeliveryDateAndStatus(any(), any())).thenReturn(Collections.emptyList());

            DashboardSummary summary = service.getSummary();

            assertThat(summary.totalOrders()).isZero();
            assertThat(summary.orderedCount()).isZero();
        }

        @Test
        void 全受注がORDEREDの場合はorderedCountがtotalOrdersと一致する() {
            when(orderRepository.findAll()).thenReturn(List.of(
                    createTestOrder(1L, OrderStatus.ORDERED),
                    createTestOrder(2L, OrderStatus.ORDERED),
                    createTestOrder(3L, OrderStatus.ORDERED)));
            when(itemRepository.findAll()).thenReturn(Collections.emptyList());
            when(orderRepository.findByDeliveryDateAndStatus(any(), any())).thenReturn(Collections.emptyList());

            DashboardSummary summary = service.getSummary();

            assertThat(summary.totalOrders()).isEqualTo(3);
            assertThat(summary.orderedCount()).isEqualTo(3);
        }

        @Test
        void 混在ステータスの場合は各カウントが正確に返る() {
            when(orderRepository.findAll()).thenReturn(List.of(
                    createTestOrder(1L, OrderStatus.ORDERED),
                    createTestOrder(2L, OrderStatus.ORDERED),
                    createTestOrder(3L, OrderStatus.ACCEPTED),
                    createTestOrder(4L, OrderStatus.SHIPPED),
                    createTestOrder(5L, OrderStatus.DELIVERED),
                    createTestOrder(6L, OrderStatus.CANCELLED)));
            when(itemRepository.findAll()).thenReturn(Collections.emptyList());
            when(orderRepository.findByDeliveryDateAndStatus(any(), any())).thenReturn(Collections.emptyList());

            DashboardSummary summary = service.getSummary();

            assertThat(summary.totalOrders()).isEqualTo(6);
            assertThat(summary.orderedCount()).isEqualTo(2);
        }
    }

    @Nested
    class StockAlert {

        @Test
        void 在庫が0の品目はoutOfStockItemsにカウントされる() {
            when(orderRepository.findAll()).thenReturn(Collections.emptyList());
            when(orderRepository.findByDeliveryDateAndStatus(any(), any())).thenReturn(Collections.emptyList());

            Item item = createTestItem(1L, "赤バラ", 10);
            when(itemRepository.findAll()).thenReturn(List.of(item));
            when(inventoryQueryPort.getCurrentStock(1L)).thenReturn(0);

            DashboardSummary summary = service.getSummary();

            assertThat(summary.outOfStockItems()).isEqualTo(1);
            assertThat(summary.lowStockItems()).isZero();
        }

        @Test
        void 在庫が発注単位未満の品目はlowStockItemsにカウントされる() {
            when(orderRepository.findAll()).thenReturn(Collections.emptyList());
            when(orderRepository.findByDeliveryDateAndStatus(any(), any())).thenReturn(Collections.emptyList());

            Item item = createTestItem(1L, "赤バラ", 10);
            when(itemRepository.findAll()).thenReturn(List.of(item));
            when(inventoryQueryPort.getCurrentStock(1L)).thenReturn(5);

            DashboardSummary summary = service.getSummary();

            assertThat(summary.lowStockItems()).isEqualTo(1);
            assertThat(summary.outOfStockItems()).isZero();
        }

        @Test
        void 在庫が発注単位以上の品目はアラートに含まれない() {
            when(orderRepository.findAll()).thenReturn(Collections.emptyList());
            when(orderRepository.findByDeliveryDateAndStatus(any(), any())).thenReturn(Collections.emptyList());

            Item item = createTestItem(1L, "赤バラ", 10);
            when(itemRepository.findAll()).thenReturn(List.of(item));
            when(inventoryQueryPort.getCurrentStock(1L)).thenReturn(15);

            DashboardSummary summary = service.getSummary();

            assertThat(summary.lowStockItems()).isZero();
            assertThat(summary.outOfStockItems()).isZero();
        }

        @Test
        void 複数品目の在庫状況が正しくカウントされる() {
            when(orderRepository.findAll()).thenReturn(Collections.emptyList());
            when(orderRepository.findByDeliveryDateAndStatus(any(), any())).thenReturn(Collections.emptyList());

            Item item1 = createTestItem(1L, "赤バラ", 10);
            Item item2 = createTestItem(2L, "白バラ", 10);
            Item item3 = createTestItem(3L, "カスミソウ", 20);
            when(itemRepository.findAll()).thenReturn(List.of(item1, item2, item3));
            when(inventoryQueryPort.getCurrentStock(1L)).thenReturn(0);
            when(inventoryQueryPort.getCurrentStock(2L)).thenReturn(5);
            when(inventoryQueryPort.getCurrentStock(3L)).thenReturn(30);

            DashboardSummary summary = service.getSummary();

            assertThat(summary.outOfStockItems()).isEqualTo(1);
            assertThat(summary.lowStockItems()).isEqualTo(1);
        }
    }

    @Nested
    class ShipmentSummary {

        @Test
        void 本日の結束待ちと出荷待ちがカウントされる() {
            when(orderRepository.findAll()).thenReturn(Collections.emptyList());
            when(itemRepository.findAll()).thenReturn(Collections.emptyList());

            when(orderRepository.findByDeliveryDateAndStatus(FIXED_TODAY, OrderStatus.ACCEPTED))
                    .thenReturn(List.of(
                            createTestOrderForDate(1L, OrderStatus.ACCEPTED, FIXED_TODAY.plusDays(1)),
                            createTestOrderForDate(2L, OrderStatus.ACCEPTED, FIXED_TODAY.plusDays(1))));
            when(orderRepository.findByDeliveryDateAndStatus(FIXED_TODAY, OrderStatus.PREPARING))
                    .thenReturn(List.of(
                            createTestOrderForDate(3L, OrderStatus.PREPARING, FIXED_TODAY.plusDays(1))));

            DashboardSummary summary = service.getSummary();

            assertThat(summary.bundlingCount()).isEqualTo(2);
            assertThat(summary.shippingCount()).isEqualTo(1);
        }

        @Test
        void 本日の出荷対象がない場合は0を返す() {
            when(orderRepository.findAll()).thenReturn(Collections.emptyList());
            when(itemRepository.findAll()).thenReturn(Collections.emptyList());
            when(orderRepository.findByDeliveryDateAndStatus(any(), any())).thenReturn(Collections.emptyList());

            DashboardSummary summary = service.getSummary();

            assertThat(summary.bundlingCount()).isZero();
            assertThat(summary.shippingCount()).isZero();
        }
    }
}
