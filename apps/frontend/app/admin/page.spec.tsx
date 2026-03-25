import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage, { getInventoryAlertLabel } from "./page";

describe("AdminPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.endsWith("/admin/orders/ORD-1001")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              orderId: "ORD-1001",
              customerName: "青山フラワー",
              productName: "ローズガーデン",
              deliveryDate: "2026-04-10",
              shippingDate: "2026-04-09",
              status: "confirmed",
              deliveryAddress: "東京都港区南青山 1-2-3",
            }),
          });
        }

        if (url.includes("/admin/inventory-projections")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              startDate: "2026-04-10",
              endDate: "2026-04-12",
              dates: ["2026-04-10", "2026-04-11", "2026-04-12"],
              items: [
                {
                  materialId: "MAT-001",
                  materialName: "バラ赤",
                  projections: [
                    { date: "2026-04-10", projectedQuantity: 12 },
                    { date: "2026-04-11", projectedQuantity: -2 },
                    { date: "2026-04-12", projectedQuantity: 24 },
                  ],
                },
                {
                  materialId: "MAT-002",
                  materialName: "カスミソウ",
                  projections: [
                    { date: "2026-04-10", projectedQuantity: 6 },
                    { date: "2026-04-11", projectedQuantity: 5 },
                    { date: "2026-04-12", projectedQuantity: 22 },
                  ],
                },
              ],
            }),
          });
        }

        if (url.endsWith("/admin/materials") && init?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              materialId: "MAT-001",
              materialName: "バラ赤 特選",
              shelfLifeDays: 5,
              purchaseUnit: 10,
              leadTimeDays: 2,
              supplierName: "東京フラワー商事",
            }),
          });
        }

        if (url.endsWith("/admin/materials")) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                materialId: "MAT-001",
                materialName: "バラ赤",
                shelfLifeDays: 5,
                purchaseUnit: 10,
                leadTimeDays: 2,
                supplierName: "東京フラワー商事",
              },
              {
                materialId: "MAT-002",
                materialName: "カスミソウ",
                shelfLifeDays: 4,
                purchaseUnit: 6,
                leadTimeDays: 1,
                supplierName: "関東グリーンサプライ",
              },
            ],
          });
        }

        if (url.endsWith("/admin/products") && init?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              productId: "rose-garden",
              productName: "ローズガーデン プレミアム",
              description: "赤バラを増量した上位版ブーケです。",
              price: 6800,
              isActive: true,
              materials: [
                { materialId: "MAT-001", quantity: 12 },
                { materialId: "MAT-002", quantity: 3 },
              ],
            }),
          });
        }

        if (url.endsWith("/admin/products")) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                productId: "rose-garden",
                productName: "ローズガーデン",
                description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
                price: 5500,
                isActive: true,
                materials: [
                  { materialId: "MAT-001", quantity: 10 },
                  { materialId: "MAT-002", quantity: 2 },
                ],
              },
              {
                productId: "white-lily",
                productName: "ホワイトリリー",
                description: "白を基調にまとめた、上品で落ち着いたアレンジです。",
                price: 6200,
                isActive: true,
                materials: [
                  { materialId: "MAT-001", quantity: 8 },
                  { materialId: "MAT-002", quantity: 4 },
                ],
              },
            ],
          });
        }

        if (url.includes("/admin/purchase-orders/candidates")) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                supplierName: "東京フラワー商事",
                items: [
                  {
                    materialId: "MAT-001",
                    materialName: "バラ赤",
                    shortageDate: "2026-04-11",
                    shortageQuantity: 2,
                    suggestedQuantity: 10,
                    purchaseUnit: 10,
                  },
                ],
              },
            ],
          });
        }

        if (url.endsWith("/admin/purchase-orders/PO-9001/receipts") && init?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              purchaseOrderId: "PO-9001",
              status: "一部入荷",
            }),
          });
        }

        if (url.endsWith("/admin/purchase-orders")) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                purchaseOrderId: "PO-9001",
                supplierName: "東京フラワー物流",
                status: "送信待ち",
                items: [
                  {
                    materialId: "MAT-001",
                    quantity: 10,
                    receivedQuantity: 0,
                  },
                ],
              },
            ],
          });
        }

        if (url.endsWith("/admin/orders/ORD-1002/bundle-completions") && init?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              orderId: "ORD-1002",
              status: "shipping-ready",
            }),
          });
        }

        if (url.endsWith("/admin/orders/ORD-1002/shipments") && init?.method === "POST") {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              orderId: "ORD-1002",
              status: "shipped",
            }),
          });
        }

        if (url.includes("/admin/shipping-targets")) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                orderId: "ORD-1002",
                customerName: "表参道ギャラリー",
                productName: "ホワイトリリー",
                shippingDate: "2026-04-11",
                status: "shipping-prep",
                materials: [
                  {
                    materialId: "MAT-001",
                    materialName: "バラ赤",
                    requiredQuantity: 8,
                    projectedQuantity: 8,
                  },
                ],
                hasShortage: false,
              },
            ],
          });
        }

        if (url.includes("/admin/shipments")) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              {
                orderId: "ORD-1002",
                customerName: "表参道ギャラリー",
                productName: "ホワイトリリー",
                shippingDate: "2026-04-11",
                status: "shipping-ready",
              },
            ],
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              orderId: "ORD-1001",
              customerName: "青山フラワー",
              productName: "ローズガーデン",
              deliveryDate: "2026-04-10",
              shippingDate: "2026-04-09",
              status: "confirmed",
            },
            {
              orderId: "ORD-1002",
              customerName: "表参道ギャラリー",
              productName: "ホワイトリリー",
              deliveryDate: "2026-04-12",
              shippingDate: "2026-04-11",
              status: "shipping-prep",
            },
          ],
        });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("受注一覧に主要項目を表示する", async () => {
    render(<AdminPage />);

    expect(screen.getByRole("button", { name: "受注管理" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "在庫管理" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      await screen.findByRole("heading", { level: 1, name: "受注一覧" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ORD-1001")).toBeInTheDocument();
    expect(screen.getByText("青山フラワー")).toBeInTheDocument();
    expect(screen.getByText("ローズガーデン")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2026-04-10" })).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
  });

  it("一覧の受注を選択すると詳細を表示する", async () => {
    render(<AdminPage />);

    fireEvent.click(await screen.findByRole("button", { name: "ORD-1001 の詳細を表示" }));

    expect(await screen.findByTestId("admin-order-workbench")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { level: 2, name: "受注詳細" }),
    ).toBeInTheDocument();
    expect(screen.getByText("東京都港区南青山 1-2-3")).toBeInTheDocument();
    expect(screen.getByText("2026-04-09")).toBeInTheDocument();
  });

  it("絞り込み結果が 0 件なら空状態を表示する", async () => {
    render(<AdminPage />);

    fireEvent.change(await screen.findByLabelText("顧客名"), {
      target: { value: "存在しない顧客" },
    });

    await waitFor(() => {
      expect(screen.getByText("条件に一致する受注はありません。")).toBeInTheDocument();
    });
  });

  it("対象期間を指定して在庫推移を表示する", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "在庫管理" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "在庫推移" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("期間開始")).toHaveValue("2026-04-10");
    expect(screen.getByLabelText("期間終了")).toHaveValue("2026-04-12");
    expect(screen.getByText("バラ赤")).toBeInTheDocument();
    expect(screen.getByText("2026-04-11")).toBeInTheDocument();
    expect(screen.getByText("-2")).toBeInTheDocument();
  });

  it("在庫管理から発注管理へ主導線で移動できる", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "在庫管理" }));
    fireEvent.click(await screen.findByRole("button", { name: "発注候補を確認する" }));

    expect(await screen.findByRole("heading", { level: 1, name: "発注管理" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "発注管理" })).toHaveAttribute("aria-pressed", "true");
  });

  it("不足見込みと廃棄注意を識別表示する", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "在庫管理" }));

    expect(await screen.findByText("不足見込み")).toHaveClass("status-badge");
    expect((await screen.findAllByText("廃棄注意")).length).toBeGreaterThan(0);
  });

  it("開始日が終了日より後ならエラーメッセージを表示して在庫取得しない", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "在庫管理" }));

    fireEvent.change(await screen.findByLabelText("期間開始"), {
      target: { value: "2026-04-13" },
    });

    await waitFor(() => {
      expect(screen.getByText("開始日は終了日以前で指定してください。")).toBeInTheDocument();
    });
  });

  it("花材一覧から編集内容を保存できる", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "花材管理" }));

    expect(await screen.findByRole("heading", { level: 1, name: "花材管理" })).toBeInTheDocument();
    expect(screen.getByText("バラ赤")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "バラ赤 を編集" }));
    fireEvent.change(screen.getByLabelText("花材名"), {
      target: { value: "バラ赤 特選" },
    });
    fireEvent.click(screen.getByRole("button", { name: "花材を保存する" }));

    expect(await screen.findByText("花材を保存しました。")).toBeInTheDocument();
  });

  it("商品一覧から編集内容を保存できる", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "商品管理" }));

    expect(await screen.findByRole("heading", { level: 1, name: "商品管理" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "ローズガーデン を編集" }));
    fireEvent.change(screen.getByLabelText("商品名"), {
      target: { value: "ローズガーデン プレミアム" },
    });
    fireEvent.change(screen.getByLabelText("価格"), {
      target: { value: "6800" },
    });
    fireEvent.click(screen.getByRole("button", { name: "商品を保存する" }));

    expect(await screen.findByText("商品を保存しました。")).toBeInTheDocument();
  });

  it("商品を新規登録できる", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/admin/products") && init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            productId: "new-bouquet",
            productName: "新作ブーケ",
            description: "新作の季節商品です。",
            price: 7000,
            isActive: true,
            materials: [
              { materialId: "MAT-001", quantity: 5 },
              { materialId: "MAT-002", quantity: 2 },
            ],
          }),
        });
      }

      if (url.endsWith("/admin/products")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              productId: "rose-garden",
              productName: "ローズガーデン",
              description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
              price: 5500,
              isActive: true,
              materials: [
                { materialId: "MAT-001", quantity: 10 },
                { materialId: "MAT-002", quantity: 2 },
              ],
            },
          ],
        });
      }

      if (url.endsWith("/admin/materials")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              materialId: "MAT-001",
              materialName: "バラ赤",
              shelfLifeDays: 5,
              purchaseUnit: 10,
              leadTimeDays: 2,
              supplierName: "東京フラワー商事",
            },
            {
              materialId: "MAT-002",
              materialName: "カスミソウ",
              shelfLifeDays: 4,
              purchaseUnit: 6,
              leadTimeDays: 1,
              supplierName: "関東グリーンサプライ",
            },
          ],
        });
      }

      if (url.includes("/admin/inventory-projections")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            startDate: "2026-04-10",
            endDate: "2026-04-12",
            dates: ["2026-04-10"],
            items: [],
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "商品管理" }));
    fireEvent.click(await screen.findByRole("button", { name: "新規登録" }));
    expect(await screen.findByRole("heading", { level: 2, name: "商品新規登録" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("商品名"), {
      target: { value: "新作ブーケ" },
    });
    fireEvent.change(screen.getByLabelText("説明"), {
      target: { value: "新作の季節商品です。" },
    });
    fireEvent.change(screen.getByLabelText("価格"), {
      target: { value: "7000" },
    });
    fireEvent.change(screen.getByLabelText("バラ赤"), {
      target: { value: "5" },
    });
    expect(screen.getByLabelText("商品 ID")).toHaveValue("new-product");
    fireEvent.click(screen.getByRole("button", { name: "商品を保存する" }));

    expect(await screen.findByText("商品を保存しました。")).toBeInTheDocument();
  });

  it("仕入先別の発注候補を確認して確定できる", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/admin/materials")) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }

      if (url.includes("/admin/purchase-orders/candidates")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              supplierName: "東京フラワー商事",
              items: [
                {
                  materialId: "MAT-001",
                  materialName: "バラ赤",
                  shortageDate: "2026-04-11",
                  shortageQuantity: 2,
                  suggestedQuantity: 10,
                  purchaseUnit: 10,
                },
              ],
            },
          ],
        });
      }

      if (url.endsWith("/admin/purchase-orders") && init?.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            purchaseOrderId: "PO-0001",
            status: "送信待ち",
          }),
        });
      }

      if (url.includes("/admin/inventory-projections")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            startDate: "2026-04-10",
            endDate: "2026-04-12",
            dates: ["2026-04-10", "2026-04-11", "2026-04-12"],
            items: [],
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "発注管理" }));

    expect(await screen.findByRole("heading", { level: 1, name: "発注管理" })).toBeInTheDocument();
    expect(screen.getByText("東京フラワー商事")).toBeInTheDocument();
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "発注を確定する" }));

    expect(await screen.findByText("発注を登録しました。状態: 送信待ち")).toBeInTheDocument();
  });

  it("入荷対象を確認して入荷実績を登録できる", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "入荷管理" }));

    expect(await screen.findByRole("heading", { level: 1, name: "入荷管理" })).toBeInTheDocument();
    expect(screen.getByText("PO-9001 / 東京フラワー物流")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "入荷を登録する" }));

    expect(await screen.findByText("入荷実績を登録しました。状態: 一部入荷")).toBeInTheDocument();
  });

  it("出荷対象を確認して結束完了を登録できる", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "出荷管理" }));

    expect(await screen.findByRole("heading", { level: 1, name: "出荷管理" })).toBeInTheDocument();
    expect((await screen.findAllByText("ORD-1002 / 表参道ギャラリー")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "結束完了を登録する" }));

    expect(await screen.findByText("結束完了を登録しました。")).toBeInTheDocument();
  });

  it("出荷準備完了の対象を出荷済みに確定できる", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "出荷管理" }));

    expect(await screen.findByText("出荷確定対象")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "出荷実績を確定する" }));

    expect(await screen.findByText("出荷実績を確定しました。")).toBeInTheDocument();
  });

  it("花材保存の通信例外を画面で案内する", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/admin/materials") && init?.method === "POST") {
        return Promise.reject(new TypeError("Failed to fetch"));
      }

      if (url.endsWith("/admin/products")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              productId: "rose-garden",
              productName: "ローズガーデン",
              description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
              price: 5500,
              isActive: true,
              materials: [
                { materialId: "MAT-001", quantity: 10 },
              ],
            },
          ],
        });
      }

      if (url.endsWith("/admin/materials")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              materialId: "MAT-001",
              materialName: "バラ赤",
              shelfLifeDays: 5,
              purchaseUnit: 10,
              leadTimeDays: 2,
              supplierName: "東京フラワー商事",
            },
          ],
        });
      }

      if (url.includes("/admin/inventory-projections")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            startDate: "2026-04-10",
            endDate: "2026-04-12",
            dates: ["2026-04-10", "2026-04-11", "2026-04-12"],
            items: [],
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "花材管理" }));
    fireEvent.click(await screen.findByRole("button", { name: "バラ赤 を編集" }));
    fireEvent.click(screen.getByRole("button", { name: "花材を保存する" }));

    expect(await screen.findByText("花材を保存できませんでした。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("発注確定の通信例外を画面で案内する", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.includes("/admin/purchase-orders/candidates")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              supplierName: "東京フラワー商事",
              items: [
                {
                  materialId: "MAT-001",
                  materialName: "バラ赤",
                  shortageDate: "2026-04-11",
                  shortageQuantity: 2,
                  suggestedQuantity: 10,
                  purchaseUnit: 10,
                },
              ],
            },
          ],
        });
      }

      if (url.endsWith("/admin/purchase-orders") && init?.method === "POST") {
        return Promise.reject(new TypeError("Failed to fetch"));
      }

      if (url.includes("/admin/inventory-projections")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            startDate: "2026-04-10",
            endDate: "2026-04-12",
            dates: ["2026-04-10", "2026-04-11", "2026-04-12"],
            items: [],
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "発注管理" }));
    fireEvent.click(await screen.findByRole("button", { name: "発注を確定する" }));

    expect((await screen.findAllByText("発注を登録できませんでした。")).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });

  it("商品保存の通信例外を画面で案内する", async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/admin/products") && init?.method === "POST") {
        return Promise.reject(new TypeError("Failed to fetch"));
      }

      if (url.endsWith("/admin/products")) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            {
              productId: "rose-garden",
              productName: "ローズガーデン",
              description: "赤バラとグリーンを束ねた、記念日向けの定番ブーケです。",
              price: 5500,
              isActive: true,
              materials: [
                { materialId: "MAT-001", quantity: 10 },
              ],
            },
          ],
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "商品管理" }));
    fireEvent.click(await screen.findByRole("button", { name: "ローズガーデン を編集" }));
    fireEvent.click(screen.getByRole("button", { name: "商品を保存する" }));

    expect(await screen.findByText("商品を保存できませんでした。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });
});

describe("AdminPage loading state", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("各ワークベンチの読み込み中を表示できる", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        return new Promise((resolve) => {
          setTimeout(() => {
            if (url.includes("/admin/inventory-projections")) {
              resolve({
                ok: true,
                json: async () => ({
                  startDate: "2026-04-10",
                  endDate: "2026-04-12",
                  dates: ["2026-04-10"],
                  items: [],
                }),
              });
              return;
            }

            if (url.endsWith("/admin/materials")) {
              resolve({
                ok: true,
                json: async () => [],
              });
              return;
            }

            if (url.includes("/admin/purchase-orders/candidates")) {
              resolve({
                ok: true,
                json: async () => [],
              });
              return;
            }

            if (url.endsWith("/admin/purchase-orders")) {
              resolve({
                ok: true,
                json: async () => [],
              });
              return;
            }

            if (url.includes("/admin/shipping-targets")) {
              resolve({
                ok: true,
                json: async () => [],
              });
              return;
            }

            if (url.includes("/admin/shipments")) {
              resolve({
                ok: true,
                json: async () => [],
              });
              return;
            }

            resolve({
              ok: true,
              json: async () => [],
            });
          }, 50);
        });
      }),
    );

    render(<AdminPage />);

    expect(screen.getByText("受注一覧を読み込んでいます。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "在庫管理" }));
    expect(screen.getByText("在庫推移を読み込んでいます。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "商品管理" }));
    expect(screen.getByText("商品一覧を読み込んでいます。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "花材管理" }));
    expect(screen.getByText("花材一覧を読み込んでいます。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "発注管理" }));
    expect(screen.getByText("発注候補を読み込んでいます。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "入荷管理" }));
    expect(screen.getByText("入荷対象を読み込んでいます。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "出荷管理" }));
    expect(screen.getByText("出荷対象を読み込んでいます。")).toBeInTheDocument();
    expect(screen.getByText("出荷確定対象を読み込んでいます。")).toBeInTheDocument();

    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });
});

describe("AdminPage inventory fetch error", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/admin/inventory-projections")) {
          return Promise.resolve({
            ok: false,
            json: async () => ({}),
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("在庫推移の取得失敗を画面で案内する", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "在庫管理" }));

    expect(
      await screen.findByText("在庫推移を取得できませんでした。再試行してください。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行" })).toBeInTheDocument();
  });
});

describe("AdminPage network error", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes("/admin/inventory-projections")) {
          return Promise.reject(new TypeError("Failed to fetch"));
        }

        return Promise.reject(new TypeError("Failed to fetch"));
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("受注一覧の通信例外でも画面が落ちず空状態を維持する", async () => {
    render(<AdminPage />);

    expect(await screen.findByText("受注一覧を取得できませんでした。")).toBeInTheDocument();
  });

  it("在庫推移の通信例外を画面で案内する", async () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole("button", { name: "在庫管理" }));

    expect(
      await screen.findByText("在庫推移を取得できませんでした。再試行してください。"),
    ).toBeInTheDocument();
  });
});

describe("getInventoryAlertLabel", () => {
  it("数量に応じて注意ラベルを返す", () => {
    expect(getInventoryAlertLabel(-1)).toBe("不足見込み");
    expect(getInventoryAlertLabel(22)).toBe("廃棄注意");
    expect(getInventoryAlertLabel(10)).toBeNull();
  });
});
