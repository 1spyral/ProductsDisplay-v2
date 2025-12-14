export function isUuidV4(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
    );
}

// New scheme: objectKey is "<uuid>" or "<uuid>.<ext>"
export function isGlobalImageObjectKey(objectKey: string): boolean {
    const base = objectKey.split(".")[0] ?? "";
    return isUuidV4(base);
}

export function buildGlobalGcsPath(objectKey: string): string {
    return `images/${objectKey}`;
}
