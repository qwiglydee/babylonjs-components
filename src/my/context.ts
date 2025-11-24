import { createContext } from "@lit/context";
import { ReactiveElement } from "lit";

import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { Observable } from "@babylonjs/core/Misc/observable";

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

