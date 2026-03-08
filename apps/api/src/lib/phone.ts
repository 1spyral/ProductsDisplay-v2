const PHONE_DIGITS_REGEX = /^\d+$/;

function getNormalizedPhoneDigits(value: string): string {
    return value.replace(/\D/g, "");
}

export function isValidPhoneNumber(value: string): boolean {
    const digits = getNormalizedPhoneDigits(value);

    if (!PHONE_DIGITS_REGEX.test(digits)) {
        return false;
    }

    if (digits.length === 10) {
        return true;
    }

    return digits.length === 11 && digits.startsWith("1");
}

export function normalizePhoneNumber(value: string): string {
    const digits = getNormalizedPhoneDigits(value);

    if (digits.length === 11 && digits.startsWith("1")) {
        const nationalNumber = digits.slice(1);
        return `+1 (${nationalNumber.slice(0, 3)}) ${nationalNumber.slice(
            3,
            6
        )}-${nationalNumber.slice(6)}`;
    }

    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return value.trim();
}
