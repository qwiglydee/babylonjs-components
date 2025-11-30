/**
 * Babylon-unassociated stuff for integration
 */

import { createContext } from "@lit/context";
import { ReactiveElement } from "lit";

export interface IBabylonElem extends ReactiveElement {
  /** TODO: some public API **/
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

declare global {
  interface GlobalEventHandlersEventMap {
    'babylon.init': BabylonEvent;
    'babylon.update': BabylonEvent;
    'babylon.pick': BabylonPickEvent;
  }
}