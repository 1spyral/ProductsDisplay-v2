export function parseBoolean(value: string | undefined): boolean {
    if (!value) return false;
    return value === "1" || value.toLowerCase() === "true";
}

export function parseCsvIds(ids: string | undefined): string[] {
    if (!ids) return [];
    return ids
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
}
