export function debug(that: any, label: string, data: any = "...") {
    console.debug(that.constructor.name, label, data);
}

export function debugEvent(that: any, event: Event | CustomEvent) {
    // @ts-ignore
    debug(that, event.type, { detail: event.detail, path: event.composedPath() });
}

export function dbgChanges(that: any, changes: Map<any, unknown>) {
    return new Map(Array.from(changes.keys()).map(k => [k, that[k]]));
}
