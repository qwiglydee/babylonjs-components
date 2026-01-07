import { createContext } from "@lit/context";
import type { ReactiveElement } from "lit";

import type { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import type { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import type { Node } from "@babylonjs/core/node";
import type { Scene } from "@babylonjs/core/scene";
import type { Nullable } from "@babylonjs/core/types";
import type { Observable } from "@babylonjs/core/Misc/observable";
import type { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";

export interface BoundsInfo {
    model: BoundingInfo; // all (non-aux) objects in scene 
    world: BoundingInfo; // the bounds symmetric around 0
}

export interface IBabylonElem extends ReactiveElement {
    readonly worldSize: number;
    readonly rightHanded: boolean;
    
    readonly scene: Scene;
    bounds: BoundsInfo;
    picked: Nullable<PickingInfo>;

    onUpdatedObservable: Observable<Scene>;
    onPickedObservable: Observable<Nullable<PickingInfo>>;

    /* query = #id | tagsquery  */
    querySelectorNodes(query: string): Node[];
    querySelectorNode(query: string): Nullable<Node>;
}

export const babylonCtx = createContext<IBabylonElem>('babylon.ctx');
export const sceneCtx = createContext<Scene>(Symbol('babylon.scene'));
export const boundsCtx = createContext<BoundsInfo>(Symbol('babylon.bounds'));
export const pickCtx = createContext<Nullable<PickingInfo>>(Symbol('babylon.pick'));


export const guiCtx = createContext<AdvancedDynamicTexture>(Symbol('babylon.gui'));
