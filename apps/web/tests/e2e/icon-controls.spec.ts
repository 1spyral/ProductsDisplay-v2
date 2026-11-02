import { expect, test } from "playwright/test";

test("cart quantity and close controls retain their accessible actions", async ({
    page,
}, testInfo) => {
    await page.addInitScript(() => {
        localStorage.setItem(
            "cart",
            JSON.stringify([
                {
                    productId: "icon-control-test",
                    productName: "Icon test chair",
                    imageUrl: null,
                    price: null,
                    quantity: 2,
                },
            ])
        );
    });
    await page.goto("/");
    await page
        .getByRole("button", { name: "Cart, 2 items", exact: true })
        .click();
    await expect(page.getByRole("heading", { name: "Cart (2)" })).toBeVisible();
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByRole("heading", { name: "Cart (3)" })).toBeVisible();
    await page.getByRole("button", { name: "Decrease quantity" }).click();
    await expect(page.getByRole("heading", { name: "Cart (2)" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("cart-controls.png") });
    await page.getByRole("button", { name: "Close cart", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Cart (2)" })).toBeHidden();
});

test("admin sort and modal controls retain their accessible actions", async ({
    page,
}, testInfo) => {
    await page.goto("/admin/login");
    await page
        .getByLabel("Password", { exact: true })
        .fill(process.env.ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard\/products$/);
    await page.getByLabel("Sort By", { exact: true }).selectOption("name");
    await page.getByRole("button", { name: "Ascending", exact: true }).click();
    await expect(
        page.getByRole("button", { name: "Descending", exact: true })
    ).toBeVisible();
    await page
        .getByRole("button", { name: "Add Product", exact: true })
        .click();
    await expect(
        page.getByRole("heading", { name: "Add New Product" })
    ).toBeVisible();
    await page.screenshot({
        path: testInfo.outputPath("admin-product-modal.png"),
    });
    await page
        .getByRole("button", { name: "Close Modal", exact: true })
        .click();
    await expect(
        page.getByRole("heading", { name: "Add New Product" })
    ).toBeHidden();
});
