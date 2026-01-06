/**
 * Babylon-unassociated stuff for integration
 */

import { createContext } from "@lit/context";

export interface UsefulItem {
    name: string;
    id: string;
}

export interface IBabylonElem extends HTMLElement {
    /** TODO: some public API **/
    getStuff(): UsefulItem[];
}

export interface ISceneElem extends HTMLElement {
    enabled: boolean;
    visible: boolean;
}

export const statusCtx = createContext<string>(Symbol("app.status"));

export const babylonCtx = createContext<IBabylonElem | null>(Symbol("app.babylon"));

export type BabylonEvent = CustomEvent;

export interface PickDetail {
    name: string;
    id: string;
    enabled: boolean;
    visible: boolean;
}

export type BabylonPickEvent = CustomEvent<PickDetail | null>;
export type BabylonUpdateEvent = CustomEvent; 

declare global {
    interface GlobalEventHandlersEventMap {
        "babylon.init": BabylonEvent;
        "babylon.update": BabylonUpdateEvent;
        "babylon.pick": BabylonPickEvent;
    }
}
