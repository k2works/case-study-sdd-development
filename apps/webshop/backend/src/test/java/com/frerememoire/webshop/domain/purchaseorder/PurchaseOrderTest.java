package com.frerememoire.webshop.domain.purchaseorder;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PurchaseOrderTest {

    @Test
    void 正常に発注を作成できる() {
        PurchaseOrder po = PurchaseOrder.create(1L, "花卸問屋A", 20, LocalDate.of(2026, 5, 10), 10);

        assertThat(po.getItemId()).isEqualTo(1L);
        assertThat(po.getSupplierName()).isEqualTo("花卸問屋A");
        assertThat(po.getQuantity()).isEqualTo(20);
        assertThat(po.getDesiredDeliveryDate()).isEqualTo(LocalDate.of(2026, 5, 10));
        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.ORDERED);
    }

    @Test
    void 発注数量が購入単位の倍数でない場合は例外() {
        assertThatThrownBy(() ->
                PurchaseOrder.create(1L, "花卸問屋A", 15, LocalDate.of(2026, 5, 10), 10))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("購入単位");
    }

    @Test
    void 発注数量が0以下の場合は例外() {
        assertThatThrownBy(() ->
                PurchaseOrder.create(1L, "花卸問屋A", 0, LocalDate.of(2026, 5, 10), 10))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("数量");
    }

    @Test
    void 仕入先名が空の場合は例外() {
        assertThatThrownBy(() ->
                PurchaseOrder.create(1L, "", 10, LocalDate.of(2026, 5, 10), 10))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("仕入先名");
    }

    @Test
    void 希望納品日がnullの場合は例外() {
        assertThatThrownBy(() ->
                PurchaseOrder.create(1L, "花卸問屋A", 10, null, 10))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("希望納品日");
    }

    @Test
    void roundUpToUnitで購入単位に切り上げできる() {
        assertThat(PurchaseOrder.roundUpToUnit(15, 10)).isEqualTo(20);
        assertThat(PurchaseOrder.roundUpToUnit(10, 10)).isEqualTo(10);
        assertThat(PurchaseOrder.roundUpToUnit(1, 10)).isEqualTo(10);
        assertThat(PurchaseOrder.roundUpToUnit(21, 5)).isEqualTo(25);
    }

    @Test
    void receiveAllでステータスがRECEIVEDになる() {
        PurchaseOrder po = PurchaseOrder.create(1L, "花卸問屋A", 10, LocalDate.of(2026, 5, 10), 10);

        po.receiveAll();

        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.RECEIVED);
    }

    @Test
    void receivePartialでステータスがPARTIALになる() {
        PurchaseOrder po = PurchaseOrder.create(1L, "花卸問屋A", 10, LocalDate.of(2026, 5, 10), 10);

        po.receivePartial();

        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.PARTIAL);
    }

    @Test
    void RECEIVEDからreceivePartialは不可() {
        PurchaseOrder po = PurchaseOrder.create(1L, "花卸問屋A", 10, LocalDate.of(2026, 5, 10), 10);
        po.receiveAll();

        assertThatThrownBy(po::receivePartial)
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void RECEIVEDからreceiveAllは不可() {
        PurchaseOrder po = PurchaseOrder.create(1L, "花卸問屋A", 10, LocalDate.of(2026, 5, 10), 10);
        po.receiveAll();

        assertThatThrownBy(po::receiveAll)
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void PARTIALからreceivePartialは不可() {
        PurchaseOrder po = PurchaseOrder.create(1L, "花卸問屋A", 10, LocalDate.of(2026, 5, 10), 10);
        po.receivePartial();

        assertThatThrownBy(po::receivePartial)
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void ステータス遷移_ORDEREDからPARTIALからRECEIVED() {
        PurchaseOrder po = PurchaseOrder.create(1L, "花卸問屋A", 20, LocalDate.of(2026, 5, 10), 10);

        po.receivePartial();
        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.PARTIAL);

        po.receiveAll();
        assertThat(po.getStatus()).isEqualTo(PurchaseOrderStatus.RECEIVED);
    }
}
