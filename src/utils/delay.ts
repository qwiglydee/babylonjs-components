export function delay(time: number): Promise<void> {
    return new Promise<void>((resolve, _reject) => window.setTimeout(() => resolve(), time));
}
