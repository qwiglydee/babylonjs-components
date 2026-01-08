import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import type { ReactiveControllerHost } from "lit";

import { PointerEventTypes, type PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { Scene } from "@babylonjs/core/scene";
import type { Nullable } from "@babylonjs/core/types";
import { BabylonControllerBase } from "./base";

interface PickingHost extends ReactiveControllerHost {
    scene: Scene;
    picked: Nullable<PickingInfo>;
}

/**
 * Observe scene for pointer tap on meshes and set host.picked 
 */
export class PickingCtrl extends BabylonControllerBase<PickingHost> {
    #observers: Observer<any>[] = [];

    init() {
        this.#observers = [
            this.host.scene.onPointerObservable.add(this.#onpointer),
            this.host.scene.onMeshRemovedObservable.add(this.#onremove),
        ]
    }
    
    dispose() {
        this.#observers.forEach(_ => _.remove());
    }

    #onpointer = (info: PointerInfo) => {
        if (info.type == PointerEventTypes.POINTERTAP && info.pickInfo) {
            if (info.pickInfo?.pickedMesh) this.pick(info.pickInfo);
            else this.unpick();
        }
    }

    #onremove = (removed: AbstractMesh) => {
        if (removed === this.host.picked?.pickedMesh) this.unpick();
    }

    pick(info: PickingInfo) {
        if (this.host.picked?.pickedMesh !== info.pickedMesh) {
            this.host.picked = info;
        }
    }

    unpick() {
        this.host.picked = null;
    }
}