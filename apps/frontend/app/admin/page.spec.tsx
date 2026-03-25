import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage, { getInventoryAlertLabel } from "./page";

describe("AdminPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
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
                  materialName: "バラ赤",
                  projections: [
                    { date: "2026-04-10", projectedQuantity: 12 },
                    { date: "2026-04-11", projectedQuantity: -2 },
                    { date: "2026-04-12", projectedQuantity: 24 },
                  ],
                },
                {
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

    expect(
      await screen.findByRole("heading", { level: 2, name: "在庫推移" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("期間開始")).toHaveValue("2026-04-10");
    expect(screen.getByLabelText("期間終了")).toHaveValue("2026-04-12");
    expect(screen.getByText("バラ赤")).toBeInTheDocument();
    expect(screen.getByText("2026-04-11")).toBeInTheDocument();
    expect(screen.getByText("-2")).toBeInTheDocument();
  });

  it("不足見込みと廃棄注意を識別表示する", async () => {
    render(<AdminPage />);

    expect(await screen.findByText("不足見込み")).toBeInTheDocument();
    expect((await screen.findAllByText("廃棄注意")).length).toBeGreaterThan(0);
  });
});

describe("getInventoryAlertLabel", () => {
  it("数量に応じて注意ラベルを返す", () => {
    expect(getInventoryAlertLabel(-1)).toBe("不足見込み");
    expect(getInventoryAlertLabel(22)).toBe("廃棄注意");
    expect(getInventoryAlertLabel(10)).toBeNull();
  });
});
