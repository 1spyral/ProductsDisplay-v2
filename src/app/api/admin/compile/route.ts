import { requireAdminAuth } from "@/actions/admin/auth";
import { getProductsByIds } from "@/db/queries/productQueries";
import { compilePdfFromHtml } from "@/lib/pdf/compilePdf";
import type Product from "@/types/Product";
import { buildImageUrl } from "@/utils/photo";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

type CompileRequestBody = {
    productIds?: unknown;
};

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

const IMAGE_MAX_WIDTH = 400;
const IMAGE_MAX_HEIGHT = 400;
const IMAGE_QUALITY = 60;

async function compressImageToDataUri(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const buffer = Buffer.from(await response.arrayBuffer());
        const compressed = await sharp(buffer)
            .resize(IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT, {
                fit: "inside",
                withoutEnlargement: true,
            })
            .jpeg({ quality: IMAGE_QUALITY, mozjpeg: true })
            .toBuffer();

        return `data:image/jpeg;base64,${compressed.toString("base64")}`;
    } catch {
        return null;
    }
}

async function compressProductImages(
    products: Product[]
): Promise<Map<string, string>> {
    const imageMap = new Map<string, string>();
    const entries: { key: string; url: string }[] = [];

    for (const product of products) {
        for (const image of product.images ?? []) {
            if (!imageMap.has(image.objectKey)) {
                entries.push({
                    key: image.objectKey,
                    url: buildImageUrl(image.objectKey),
                });
            }
        }
    }

    const results = await Promise.all(
        entries.map(async ({ key, url }) => {
            const dataUri = await compressImageToDataUri(url);
            return { key, dataUri };
        })
    );

    for (const { key, dataUri } of results) {
        if (dataUri) {
            imageMap.set(key, dataUri);
        }
    }

    return imageMap;
}

function renderProductCard(
    product: Product,
    imageMap: Map<string, string>
): string {
    const name = product.name?.trim() || product.id;
    const description = product.description?.trim();
    const category = product.category?.trim();
    const price = product.price?.trim();
    const badges = [
        product.clearance ? "Clearance" : null,
        product.soldOut ? "Sold out" : null,
        product.hidden ? "Hidden" : null,
    ].filter(Boolean) as string[];

    const images = product.images ?? [];
    const imageGrid =
        images.length > 0
            ? `<div class="images">
        ${images
            .map((image) => {
                const src =
                    imageMap.get(image.objectKey) ??
                    buildImageUrl(image.objectKey);
                return `<div class="image"><img src="${escapeHtml(
                    src
                )}" alt="${escapeHtml(name)}" /></div>`;
            })
            .join("")}
      </div>`
            : `<div class="no-images">No images</div>`;

    return `<section class="product">
      <div class="header">
        <div>
          <div class="title">${escapeHtml(name)}</div>
          <div class="meta">
            <span class="sku">ID: ${escapeHtml(product.id)}</span>
            ${category ? `<span>Category: ${escapeHtml(category)}</span>` : ""}
            ${price ? `<span>Price: ${escapeHtml(price)}</span>` : ""}
          </div>
        </div>
        ${
            badges.length > 0
                ? `<div class="badges">${badges
                      .map((badge) => `<span>${escapeHtml(badge)}</span>`)
                      .join("")}</div>`
                : ""
        }
      </div>
      ${description ? `<p class="description">${escapeHtml(description)}</p>` : ""}
      ${imageGrid}
    </section>`;
}

function buildPdfHtml(
    products: Product[],
    missingIds: string[],
    imageMap: Map<string, string>
): string {
    const missingBlock =
        missingIds.length > 0
            ? `<div class="missing">
      <strong>Missing products:</strong> ${missingIds
          .map((id) => escapeHtml(id))
          .join(", ")}
    </div>`
            : "";

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Products</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: "Helvetica Neue", Arial, sans-serif; color: #0f172a; padding: 32px; }
      h1 { font-size: 24px; margin: 0 0 16px; }
      .missing { margin-bottom: 16px; padding: 12px; border: 1px solid #fecaca; background: #fef2f2; color: #991b1b; font-size: 12px; }
      .product { padding: 16px 0; border-bottom: 1px solid #e2e8f0; page-break-inside: avoid; }
      .product:last-child { border-bottom: none; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
      .title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
      .meta { font-size: 12px; color: #475569; display: flex; flex-wrap: wrap; gap: 10px; }
      .badges { display: flex; gap: 6px; flex-wrap: wrap; }
      .badges span { font-size: 10px; text-transform: uppercase; padding: 4px 6px; border-radius: 999px; background: #0f172a; color: white; }
      .description { margin: 12px 0 0; font-size: 12px; color: #334155; white-space: pre-wrap; }
      .images { margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
      .image { width: 100%; height: 96px; position: relative; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc; }
      .image img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
      .no-images { margin-top: 12px; font-size: 11px; color: #64748b; }
    </style>
  </head>
  <body>
    <h1>Products</h1>
    ${missingBlock}
    ${products.map((p) => renderProductCard(p, imageMap)).join("")}
  </body>
</html>`;
}

export async function POST(request: Request) {
    await requireAdminAuth();

    let body: CompileRequestBody;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    const rawIds = body.productIds;
    if (!Array.isArray(rawIds)) {
        return NextResponse.json(
            { error: "productIds must be an array" },
            { status: 400 }
        );
    }

    const normalizedIds = rawIds
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

    if (normalizedIds.length === 0) {
        return NextResponse.json(
            { error: "No product IDs provided" },
            { status: 400 }
        );
    }

    const products = await getProductsByIds(normalizedIds, true);
    const productsById = new Map(
        products.map((product) => [product.id, product])
    );
    const orderedProducts = normalizedIds
        .map((id) => productsById.get(id))
        .filter((product): product is Product => Boolean(product));
    const missingIds = normalizedIds.filter((id) => !productsById.has(id));

    const imageMap = await compressProductImages(orderedProducts);
    const html = buildPdfHtml(orderedProducts, missingIds, imageMap);

    try {
        const pdfBytes = await compilePdfFromHtml(html);
        const pdfArrayBuffer = pdfBytes.buffer.slice(
            pdfBytes.byteOffset,
            pdfBytes.byteOffset + pdfBytes.byteLength
        ) as ArrayBuffer;
        const pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });

        return new NextResponse(pdfBlob, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": 'inline; filename="document.pdf"',
                "Cache-Control": "no-store",
            },
        });
    } catch (err) {
        return NextResponse.json(
            {
                error: "Failed to compile PDF",
                message: err instanceof Error ? err.message : String(err),
            },
            { status: 500 }
        );
    }
}
