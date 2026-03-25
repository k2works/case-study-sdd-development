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
