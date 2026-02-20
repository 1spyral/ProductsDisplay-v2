import {
    buildGlobalGcsPath,
    isGlobalImageObjectKey,
    isUuidV4,
} from "@/utils/imageKey";
import { describe, expect, test } from "bun:test";

describe("imageKey utilities", () => {
    test("validates UUID v4 values", () => {
        expect(isUuidV4("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
        expect(isUuidV4("550e8400-e29b-11d4-a716-446655440000")).toBe(false);
        expect(isUuidV4("not-a-uuid")).toBe(false);
    });

    test("validates object key format with optional extension", () => {
        expect(
            isGlobalImageObjectKey("550e8400-e29b-41d4-a716-446655440000")
        ).toBe(true);
        expect(
            isGlobalImageObjectKey("550e8400-e29b-41d4-a716-446655440000.jpg")
        ).toBe(true);
        expect(isGlobalImageObjectKey("product-123.jpg")).toBe(false);
    });

    test("builds global GCS path from object key", () => {
        expect(buildGlobalGcsPath("abc.jpg")).toBe("images/abc.jpg");
    });
});
