export function debug(that: any, label: string, data: any = "...") {
    let src = that.constructor.name;
    if (that.id) src += `#${that.id}`;
    console.debug(src, label, data);
}

export function debugEvent(that: any, event: Event | CustomEvent) {
    // @ts-ignore
    debug(that, event.type, { detail: event.detail, path: event.composedPath() });
}

export function dbgChanges(that: any, changes: Map<any, unknown>) {
    return new Map(Array.from(changes.keys()).map(k => [k, that[k]]));
}
