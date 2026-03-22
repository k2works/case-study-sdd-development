package com.frerememoire.webshop.domain.purchaseorder.port;

import com.frerememoire.webshop.domain.purchaseorder.Arrival;

import java.util.List;

public interface ArrivalRepository {

    Arrival save(Arrival arrival);

    List<Arrival> findByPurchaseOrderId(Long purchaseOrderId);
}
