type PropertyValues = Map<string, any>;

export function debug(that: any, label: string, data: any = "...") {
    const source = that.tagName ? `${that.tagName}${that.id ? '#' + that.id : ""}` : that.constructor.name; 
    console.debug(source, label, data);
}

export function debugEvent(that: any, event: Event | CustomEvent) {
    // @ts-ignore
    debug(that, event.type, { detail: event.detail, path: event.composedPath() });
}

export function debugChanges(that: HTMLElement, label: string, changes: PropertyValues, keys?: PropertyKey[]) {
    if (!keys) keys = [...changes.keys()];
    // @ts-ignore
    debug(that, label, { new: Object.fromEntries(keys.map(k => [k, that[k]])), old: Object.fromEntries(changes)});
}