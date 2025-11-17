export function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) throw TypeError(message ?? "Unexpected condition");
}

export function assertNonNull<T>(value: T | null | undefined, message?: string): asserts value is NonNullable<T> {
    if (value == null || value === undefined) throw TypeError(message ?? "Unexpected null");
}

export function assertNull<T>(value: T | null | undefined, message?: string): asserts value is null {
    if (value != null) throw TypeError(message ?? "Unexpected non-null");
}
