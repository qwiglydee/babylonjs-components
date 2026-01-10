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

/**
 * Like AssetContainer, but Model 
 * With some extensions to appear in future.
 */
export interface IModelContainer extends IAssetContainer {
    /** Indicates if there is some important (non aux) stuff present */
    isEmpty: boolean;

    getTransformNodeById(id: string): TransformNode;
    getTransformNodesByTags(query: string): TransformNode[];
    getMeshById(id: string): AbstractMesh;
    getMeshesByTags(query: string): AbstractMesh[];

    // TODO: heterogenous for positional entities
    // getStuffById(id: string): TransformNode|AbstractMesh;
    // getStuffByTags(query: string): TransformNode|AbstractMesh[];

    // TODO:
    // querySelectorNode<T extends BabylonNode>(id_or_tags: string): T;
    // querySelectorNodes<T extends BabylonNode>(id_or_tags: string): T[];
}

export interface IBaseMain {
    canvas: HTMLCanvasElement;
    engine: Engine;
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
     * Maximal possible size   
     */
    worldSize: number;

    /**
     * Scene as container
     */
    model: IModelContainer;
    
    /**
     * Bounds of current content 
     */
    bounds: BoundsInfo;

    /**
     * Something picked
     */
    picked: Nullable<PickingInfo>;
}
