import type { ReactiveElement } from "lit";
import { createContext } from "@lit/context";

import { Scene } from "@babylonjs/core/scene";

export interface IBabylonElem extends ReactiveElement {
    /** TODO: some internal API **/
}


export const sizeCtx = createContext<number>(Symbol('babylon.size'))

export const sceneCtx = createContext<Scene>(Symbol('babylon.scene'));
