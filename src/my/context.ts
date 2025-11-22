import { createContext } from "@lit/context";

import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";

export interface IBabylonElem {
    worldSize: number;
    scene: Scene;
    picked: Nullable<PickingInfo>;
}

export interface BoundsInfo {
    model: BoundingInfo; // all (non-aux) objects in scene 
    world: BoundingInfo; // the bounds symmetric around 0
}

export const sizeCtx = createContext<number>(Symbol('babylon.size'))
export const sceneCtx = createContext<Scene>(Symbol('babylon.scene'));
export const pickCtx = createContext<Nullable<PickingInfo>>(Symbol('babylon.pick'));
export const boundsCtx = createContext<Nullable<BoundsInfo>>(Symbol('babylon.bounds'));

