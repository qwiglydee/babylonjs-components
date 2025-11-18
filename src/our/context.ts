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

declare global {
  interface GlobalEventHandlersEventMap {
    'babylon.init': BabylonInitEvent;
  }
}