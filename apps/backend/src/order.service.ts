import { BadRequestException, Inject, Injectable } from "@nestjs/common";

import { InventoryService } from "./inventory.service";
import { ProductService } from "./product.service";

export type CreateOrderRequest = {
  productId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  productName: string;
  deliveryDate: string;
  deliveryAddress: string;
  message: string;
};

export type CreateOrderResponse = {
  orderId: string;
  status: "confirmed";
};

export type ChangeDeliveryDateRequest = {
  deliveryDate: string;
};

export type ChangeDeliveryDateResponse = {
  orderId: string;
  deliveryDate: string;
  shippingDate: string;
  status: OrderSummary["status"];
};

export type OrderSummary = {
  orderId: string;
  customerName: string;
  productName: string;
  deliveryDate: string;
  shippingDate: string;
  status: "confirmed" | "shipping-prep" | "shipping-ready" | "shipped";
};

export type OrderDetail = OrderSummary & {
  deliveryAddress: string;
  message: string;
};

export type DeliveryAddressHistory = {
  deliveryAddressId: string;
  recipientName: string;
  postalCode: string;
  deliveryAddress: string;
  deliveryPhoneNumber: string;
  lastUsedAt: string;
};

export type OrderFilter = {
  customerName?: string;
};

@Injectable()
export class OrderService {
  private sequence = 1;
  private readonly inventoryService: InventoryService;
  private readonly productService: ProductService;
  private readonly orders: Array<
    OrderDetail & {
      productId: string | null;
      customerEmail: string | null;
      customerPhone: string | null;
      deliveryAddressId: string | null;
      recipientName: string | null;
      postalCode: string | null;
      deliveryPhoneNumber: string | null;
    }
  > = [
    {
      productId: "rose-garden",
      orderId: "ORD-1001",
      customerName: "青山フラワー",
      customerEmail: "hanako@example.com",
      customerPhone: "090-1111-2222",
      productName: "ローズガーデン",
      deliveryDate: "2026-04-10",
      shippingDate: "2026-04-09",
      status: "confirmed",
      deliveryAddressId: "ADDR-1001",
      recipientName: "山田 花子",
      postalCode: "107-0062",
      deliveryAddress: "東京都港区南青山 1-2-3",
      deliveryPhoneNumber: "03-1234-5678",
      message: "開店祝いのお花です。",
    },
    {
      productId: "white-lily",
      orderId: "ORD-1002",
      customerName: "表参道ギャラリー",
      customerEmail: "hanako@example.com",
      customerPhone: "090-1111-2222",
      productName: "ホワイトリリー",
      deliveryDate: "2026-04-12",
      shippingDate: "2026-04-11",
      status: "shipping-prep",
      deliveryAddressId: "ADDR-1002",
      recipientName: "佐藤 一郎",
      postalCode: "150-0001",
      deliveryAddress: "東京都渋谷区神宮前 4-5-6",
      deliveryPhoneNumber: "03-1111-2222",
      message: "展示会受付にお届けしてください。",
    },
  ];

  constructor(
    @Inject(InventoryService) inventoryService: InventoryService,
    @Inject(ProductService) productService: ProductService,
  ) {
    this.inventoryService = inventoryService;
    this.productService = productService;
  }

  createOrder(request: CreateOrderRequest): CreateOrderResponse {
    const orderId = `ORD-${String(this.sequence).padStart(4, "0")}`;
    this.sequence += 1;
    const shippingDate = shiftDate(request.deliveryDate, -1);
    const product = request.productId ? this.productService.findProduct(request.productId) : undefined;
    this.orders.push({
      productId: request.productId ?? null,
      orderId,
      customerName: request.customerName ?? "オンライン顧客",
      customerEmail: request.customerEmail ?? null,
      customerPhone: request.customerPhone ?? null,
      productName: product?.productName ?? request.productName,
      deliveryDate: request.deliveryDate,
      shippingDate,
      status: "confirmed",
      deliveryAddressId: null,
      recipientName: null,
      postalCode: null,
      deliveryAddress: request.deliveryAddress,
      deliveryPhoneNumber: null,
      message: request.message,
    });

    return {
      orderId,
      status: "confirmed",
    };
  }

  listOrders(filter: OrderFilter = {}): OrderSummary[] {
    return this.orders
      .filter((order) => {
        if (!filter.customerName) {
          return true;
        }

        return order.customerName.includes(filter.customerName);
      })
      .map(({ orderId, customerName, productName, deliveryDate, shippingDate, status }) => ({
        orderId,
        customerName,
        productName,
        deliveryDate,
        shippingDate,
        status,
      }));
  }

  getOrderDetail(orderId: string): OrderDetail | undefined {
    const order = this.orders.find((candidate) => candidate.orderId === orderId);

    if (!order) {
      return undefined;
    }

    return this.toOrderDetail(order);
  }

  listOrdersByShippingDate(shippingDate: string): OrderDetail[] {
    return this.orders
      .filter((order) => order.shippingDate === shippingDate)
      .map((order) => this.toOrderDetail(order));
  }

  updateOrderStatus(orderId: string, status: OrderSummary["status"]): OrderDetail | undefined {
    const target = this.orders.find((order) => order.orderId === orderId);

    if (!target) {
      return undefined;
    }

    target.status = status;
    return this.toOrderDetail(target);
  }

  getOrderRecord(
    orderId: string,
  ): (OrderDetail & { productId: string | null }) | undefined {
    return this.orders.find((order) => order.orderId === orderId);
  }

  listOrdersByStatus(status: OrderSummary["status"], shippingDate?: string): OrderDetail[] {
    return this.orders
      .filter((order) => order.status === status)
      .filter((order) => (shippingDate ? order.shippingDate === shippingDate : true))
      .map((order) => this.toOrderDetail(order));
  }

  listDeliveryAddresses(customerEmail: string, customerPhone: string): DeliveryAddressHistory[] {
    const normalizedEmail = normalizeEmail(customerEmail);
    const normalizedPhone = normalizePhone(customerPhone);

    return this.orders
      .filter((order) => normalizeEmail(order.customerEmail) === normalizedEmail)
      .filter((order) => normalizePhone(order.customerPhone) === normalizedPhone)
      .filter((order) => order.deliveryAddressId)
      .map((order) => ({
        deliveryAddressId: order.deliveryAddressId ?? "",
        recipientName: order.recipientName ?? "",
        postalCode: order.postalCode ?? "",
        deliveryAddress: order.deliveryAddress,
        deliveryPhoneNumber: order.deliveryPhoneNumber ?? "",
        lastUsedAt: order.deliveryDate,
      }))
      .sort((left, right) => right.lastUsedAt.localeCompare(left.lastUsedAt));
  }

  changeDeliveryDate(orderId: string, request: ChangeDeliveryDateRequest): ChangeDeliveryDateResponse {
    const order = this.orders.find((candidate) => candidate.orderId === orderId);

    if (!order) {
      throw new BadRequestException("対象受注が存在しません。");
    }

    if (!isValidDateInput(request.deliveryDate)) {
      throw new BadRequestException("届け日は YYYY-MM-DD 形式で入力してください。");
    }

    if (order.status === "shipping-ready" || order.status === "shipped") {
      throw new BadRequestException("出荷準備済みのため届け日を変更できません。");
    }

    const nextShippingDate = shiftDate(request.deliveryDate, -1);
    const recipe = order.productId ? this.productService.findProduct(order.productId)?.materials ?? [] : [];
    const hasShortage = recipe.some(
      (material) => this.inventoryService.getProjectedQuantity(material.materialId, nextShippingDate) < material.quantity,
    );

    if (hasShortage) {
      throw new BadRequestException("在庫不足のため届け日を変更できません。");
    }

    order.deliveryDate = request.deliveryDate;
    order.shippingDate = nextShippingDate;

    return {
      orderId: order.orderId,
      deliveryDate: order.deliveryDate,
      shippingDate: order.shippingDate,
      status: order.status,
    };
  }

  private toOrderDetail(
    order: OrderDetail & {
      productId: string | null;
      customerEmail: string | null;
      customerPhone: string | null;
      deliveryAddressId: string | null;
      recipientName: string | null;
      postalCode: string | null;
      deliveryPhoneNumber: string | null;
    },
  ): OrderDetail {
    const { productId: _productId, ...detail } = order;
    const {
      customerEmail: _customerEmail,
      customerPhone: _customerPhone,
      deliveryAddressId: _deliveryAddressId,
      recipientName: _recipientName,
      postalCode: _postalCode,
      deliveryPhoneNumber: _deliveryPhoneNumber,
      ...response
    } = detail;

    return response;
  }
}

function shiftDate(date: string, diffDays: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + diffDays);

  return value.toISOString().slice(0, 10);
}

function normalizeEmail(value: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

function normalizePhone(value: string | null): string {
  return value?.replace(/\D/g, "") ?? "";
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
