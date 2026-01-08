/**
 * @module
 * These are all internal interfaces for babylon-aware components
 */

import type { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import type { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { IAssetContainer } from "@babylonjs/core/IAssetContainer";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { Nullable } from "@babylonjs/core/types";

export interface IModelContainer extends IAssetContainer {
    isEmpty: boolean;

    getTransformNodeById(id: string): TransformNode;
    getTransformNodesByTags(query: string): TransformNode[];
    getMeshById(id: string): AbstractMesh;
    getMeshesByTags(query: string): AbstractMesh[];
}

export interface IBaseMain {
    canvas: HTMLCanvasElement;
    engine: Engine;

    /** @context babylon.scene */
    scene: Scene;

    whenReady: { promise: Promise<boolean> };
    isReady: boolean;
}

export interface BoundsInfo {
    /** Bounds of all (important) meshes in scene */
    model: BoundingInfo;
    /** The bounds symmetric around 0 */
    world: BoundingInfo;
}

/**
 * The demo main element
 */
export interface IMyMain extends IBaseMain {
    /** 
     * @context babylon.model 
     * same as scene, but transparent via utility scene 
     */
    model: IModelContainer;

    /** @property */
    worldSize: number;
    
    /** @context babylon.bounds */
    bounds: BoundsInfo;

    /** @context babylon.pick */
    picked: Nullable<PickingInfo>;
}
