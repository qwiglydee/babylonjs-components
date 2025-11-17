export function bubbleEvent<T>(that: HTMLElement, type: string, detail?: T): void {
    that.dispatchEvent(new CustomEvent<T>(type, { detail, bubbles: true, composed: true }));
}

export function queueEvent<T>(that: HTMLElement, type: string, detail?: T): any {
    queueMicrotask(() => bubbleEvent<T>(that, type, detail));
}

export function scheduleEvent<T>(timer: number, time: number, that: HTMLElement, type: string, detail?: T): any {
    if (timer) clearTimeout(timer);
    return setTimeout(() => bubbleEvent<T>(that, type, detail), time);
}

export function origTarget(event: Event | CustomEvent): HTMLElement {
    return event.composedPath()[0] as HTMLElement;
}
