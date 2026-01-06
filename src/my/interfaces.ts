/**
 * @module
 * These are all internal interfaces for babylon-aware components
 */

import type { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import type { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import type { Engine } from "@babylonjs/core/Engines/engine";
import type { Scene } from "@babylonjs/core/scene";
import type { Nullable } from "@babylonjs/core/types";
import type { Node as BabylonNode } from "@babylonjs/core/node";

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
    worldSize: number;

    /** @context */
    bounds: BoundsInfo;

    /** @context */
    picked: Nullable<PickingInfo>;

    // TODO: move to `modelcontainer` interface
    querySelectorNodes<T extends BabylonNode>(query: string): T[];
    querySelectorNode<T extends BabylonNode>(query: string): Nullable<T>;
}
