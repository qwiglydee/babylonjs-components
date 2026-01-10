/**
 * @module
 * These are all external interfaces for babylon-unaware scripts
 */

export interface IBabylonItem {
    name: string;
    id: string;
    enabled?: boolean;
    visible?: boolean;
}

export interface IBabylonElem extends HTMLElement {
    getStuff(): IBabylonItem[];
}

export interface IComponentElem extends HTMLElement {
    enabled?: boolean;
    visible?: boolean;
}

/**
 * @event babylon.init
 *
 * Emitted when main component and scene initialized and ready
 */
export type BabylonInitEvent = CustomEvent;

/**
 * @event babylon.update
 *
 * Emitted when content of scene changes
 */
export type BabylonUpdateEvent = CustomEvent;

/**
 * @event babylon.pick
 *
 * Emitted when something picked in scene
 */
export type BabylonPickEvent = CustomEvent<IBabylonItem | null>;

declare global {
    interface GlobalEventHandlersEventMap {
        "babylon.init": BabylonInitEvent;
        "babylon.update": BabylonUpdateEvent;
        "babylon.pick": BabylonPickEvent;
    }
}
