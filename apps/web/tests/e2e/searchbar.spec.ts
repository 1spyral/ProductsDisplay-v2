import { expect, test } from "playwright/test";

test("submits search query with Enter", async ({ page }) => {
    await page.goto("/");

    const input = page.getByPlaceholder("Search for products...");
    await input.fill("chairs & tables");
    await input.press("Enter");

    await expect(page).toHaveURL(/\/search\?query=chairs%20%26%20tables$/);
    await expect(
        page.getByText('No products found for "chairs & tables"')
    ).toBeVisible();
});
