import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseSearchParams } = vi.hoisted(() => ({
  mockUseSearchParams: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: mockUseSearchParams,
}));

import OrderPage, { validateOrderForm } from "./page";

describe("OrderPage", () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("product=rose-garden"));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          orderId: "ORD-0001",
          status: "confirmed",
        }),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("選択した商品を注文入力画面で確認できる", () => {
    render(<OrderPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "注文入力" }),
    ).toBeInTheDocument();
    expect(screen.getByText("選択中の商品")).toBeInTheDocument();
    expect(screen.getByText("ローズガーデン")).toBeInTheDocument();
  });

  it("届け日、届け先、メッセージを入力できる", () => {
    render(<OrderPage />);

    const deliveryDate = screen.getByLabelText("届け日");
    const deliveryAddress = screen.getByLabelText("届け先");
    const message = screen.getByLabelText("メッセージ");

    fireEvent.change(deliveryDate, { target: { value: "2026-03-31" } });
    fireEvent.change(deliveryAddress, { target: { value: "東京都港区南青山 1-2-3" } });
    fireEvent.change(message, { target: { value: "開店祝いのメッセージを添えてください。" } });

    expect(deliveryDate).toHaveValue("2026-03-31");
    expect(deliveryAddress).toHaveValue("東京都港区南青山 1-2-3");
    expect(message).toHaveValue("開店祝いのメッセージを添えてください。");
  });

  it("必須項目が未入力のまま送信するとエラーを表示する", () => {
    render(<OrderPage />);

    fireEvent.click(screen.getByRole("button", { name: "入力内容を確認する" }));

    expect(screen.getByText("届け日は必須です。")).toBeInTheDocument();
    expect(screen.getByText("届け先は必須です。")).toBeInTheDocument();
    expect(screen.getByText("メッセージは必須です。")).toBeInTheDocument();
  });

  it("入力内容を確認画面に表示できる", () => {
    render(<OrderPage />);

    fireEvent.change(screen.getByLabelText("届け日"), {
      target: { value: "2026-04-10" },
    });
    fireEvent.change(screen.getByLabelText("届け先"), {
      target: { value: "東京都港区南青山 1-2-3" },
    });
    fireEvent.change(screen.getByLabelText("メッセージ"), {
      target: { value: "開店祝いのお花です。" },
    });

    fireEvent.click(screen.getByRole("button", { name: "入力内容を確認する" }));

    expect(
      screen.getByRole("heading", { level: 2, name: "注文内容の確認" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2026-04-10")).toBeInTheDocument();
    expect(screen.getByText("東京都港区南青山 1-2-3")).toBeInTheDocument();
    expect(screen.getByText("開店祝いのお花です。")).toBeInTheDocument();
  });

  it("確認画面から入力画面へ戻って修正できる", () => {
    render(<OrderPage />);

    fireEvent.change(screen.getByLabelText("届け日"), {
      target: { value: "2026-04-10" },
    });
    fireEvent.change(screen.getByLabelText("届け先"), {
      target: { value: "東京都港区南青山 1-2-3" },
    });
    fireEvent.change(screen.getByLabelText("メッセージ"), {
      target: { value: "開店祝いのお花です。" },
    });

    fireEvent.click(screen.getByRole("button", { name: "入力内容を確認する" }));
    fireEvent.click(screen.getByRole("button", { name: "入力画面に戻る" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "注文入力" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("届け日")).toHaveValue("2026-04-10");
    expect(screen.getByLabelText("届け先")).toHaveValue("東京都港区南青山 1-2-3");
    expect(screen.getByLabelText("メッセージ")).toHaveValue("開店祝いのお花です。");
  });

  it("確認画面で確定すると完了画面を表示する", async () => {
    render(<OrderPage />);

    fireEvent.change(screen.getByLabelText("届け日"), {
      target: { value: "2026-04-10" },
    });
    fireEvent.change(screen.getByLabelText("届け先"), {
      target: { value: "東京都港区南青山 1-2-3" },
    });
    fireEvent.change(screen.getByLabelText("メッセージ"), {
      target: { value: "開店祝いのお花です。" },
    });

    fireEvent.click(screen.getByRole("button", { name: "入力内容を確認する" }));
    fireEvent.click(screen.getByRole("button", { name: "注文を確定する" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: "注文が完了しました" }),
    ).toBeInTheDocument();
    expect(screen.getByText("注文番号: ORD-0001")).toBeInTheDocument();
  });
});

describe("OrderPage submit error", () => {
  beforeEach(() => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("product=rose-garden"));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("注文確定時の通信例外を画面で案内する", async () => {
    render(<OrderPage />);

    fireEvent.change(screen.getByLabelText("届け日"), {
      target: { value: "2026-04-10" },
    });
    fireEvent.change(screen.getByLabelText("届け先"), {
      target: { value: "東京都港区南青山 1-2-3" },
    });
    fireEvent.change(screen.getByLabelText("メッセージ"), {
      target: { value: "開店祝いのお花です。" },
    });

    fireEvent.click(screen.getByRole("button", { name: "入力内容を確認する" }));
    fireEvent.click(screen.getByRole("button", { name: "注文を確定する" }));

    expect(
      await screen.findByText("注文の確定に失敗しました。時間をおいて再度お試しください。"),
    ).toBeInTheDocument();
  });
});

describe("validateOrderForm", () => {
  it("必須項目の未入力を検出する", () => {
    expect(
      validateOrderForm({
        deliveryDate: "",
        deliveryAddress: " ",
        message: "",
      }),
    ).toEqual({
      deliveryDate: "届け日は必須です。",
      deliveryAddress: "届け先は必須です。",
      message: "メッセージは必須です。",
    });
  });

  it("入力済みの項目はエラーにしない", () => {
    expect(
      validateOrderForm({
        deliveryDate: "2026-03-31",
        deliveryAddress: "東京都港区南青山 1-2-3",
        message: "開店祝いのメッセージを添えてください。",
      }),
    ).toEqual({});
  });
});
