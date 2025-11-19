import type { ReactiveElement } from "lit";
import { createContext } from "@lit/context";

import { Scene } from "@babylonjs/core/scene";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { Nullable } from "@babylonjs/core/types";

export interface IBabylonElem extends ReactiveElement {
    /** some internal API **/
    worldSize: number;
    scene: Scene;
    picked: Nullable<PickingInfo>;
}

export const sizeCtx = createContext<number>(Symbol('babylon.size'))
export const sceneCtx = createContext<Scene>(Symbol('babylon.scene'));
export const pickCtx = createContext<Nullable<PickingInfo>>(Symbol('babylon.pick'));

