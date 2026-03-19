import { expect, test } from "@playwright/test";

test("顧客が商品一覧から注文入力画面へ進める", async ({ page }) => {
  await page.goto("/customer");

  await expect(
    page.getByRole("heading", { level: 1, name: "花束を選んで注文する" }),
  ).toBeVisible();

  const roseGardenCard = page.locator("article").filter({ hasText: "ローズガーデン" });
  await roseGardenCard.getByRole("link", { name: "この花束を注文する" }).click();

  await expect(page).toHaveURL(/\/customer\/order\?product=rose-garden$/);
  await expect(page.getByRole("heading", { level: 1, name: "注文入力" })).toBeVisible();
  await expect(page.getByText("ローズガーデン")).toBeVisible();
});
