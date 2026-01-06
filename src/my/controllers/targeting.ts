import { ReactiveControllerHost } from "lit";

import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { Nullable } from "@babylonjs/core/types";
import { Observable } from "@babylonjs/core/Misc/observable";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { BabylonControllerBase } from "./base";

interface TargetingHost extends ReactiveControllerHost {
    babylon: {
        onPickedObservable: Observable<Nullable<PickingInfo>>
    };
    _target: Nullable<AbstractMesh>;
}

/**
 * Using main babylon picking observer and setting host._target 
 */
export class TargetingCtrl extends BabylonControllerBase<TargetingHost> {
    #observer: any;

    override init() {
        this.#observer = this.host.babylon.onPickedObservable.add(this.#onpick);
    }

    override dispose(): void {
        this.#observer.remove();
    }

    #onpick = (info: Nullable<PickingInfo>) => {
        this.host._target = info?.pickedMesh ?? null;
    };
}
