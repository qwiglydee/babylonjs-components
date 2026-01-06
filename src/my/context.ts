import { createContext } from "@lit/context";
import { ReactiveElement } from "lit";

import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { Observable } from "@babylonjs/core/Misc/observable";
import { Engine } from "@babylonjs/core/Engines/engine";


export interface ISceneBase extends ReactiveElement {
    rightHanded: boolean;

    engine: Engine;
    scene: Scene;

    whenReady: { promise: Promise<boolean> };
    isReady: boolean;
}


export interface BoundsInfo {
    model: BoundingInfo; // all (non-aux) objects in scene 
    world: BoundingInfo; // the bounds symmetric around 0
}

export interface IBabylonElem extends ISceneBase {
    /** assumed maximum scene size */
    readonly worldSize: number;
    
    // bounds: BoundsInfo;
    // picked: Nullable<PickingInfo>;

    onSceneObservable: Observable<Scene>;
    onPickedObservable: Observable<Nullable<PickingInfo>>;

    // /* query = #id | tagsquery  */
    // querySelectorNodes(query: string): Node[];
    // querySelectorNode(query: string): Nullable<Node>;
}

export const babylonCtx = createContext<IBabylonElem>('babylon.ctx');
export const sceneCtx = createContext<Scene>(Symbol('babylon.scene'));
export const boundsCtx = createContext<BoundsInfo>(Symbol('babylon.bounds'));
export const pickCtx = createContext<Nullable<PickingInfo>>(Symbol('babylon.pick'));

