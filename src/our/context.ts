/**
 * Babylon-unassociated stuff for integration
 */

import { createContext } from "@lit/context";

export interface IBabylonElem extends HTMLElement {
  /** TODO: some public API **/
}

export const statusCtx = createContext<string>(Symbol("app.status"));

export const babylonCtx = createContext<IBabylonElem | null>(Symbol("app.babylon"));

export type BabylonInitEvent = CustomEvent;

export interface PickDetail {
  name: string;
  id: string;
}

export type BabylonPickEvent = CustomEvent<PickDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'babylon.init': BabylonInitEvent;
    'babylon.pick': BabylonPickEvent;
  }
}