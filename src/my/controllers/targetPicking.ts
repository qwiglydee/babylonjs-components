
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Nullable } from "@babylonjs/core/types";

import { IBabylonElem } from "../context";
import { BabylonController, BabylonHost } from "./base";

export interface TargetingHost extends BabylonHost {
    readonly babylon: IBabylonElem;
    target: Nullable<AbstractMesh>;
}

export class TargetingCtrl extends BabylonController<TargetingHost> {

    #observer: any;

    override init() {
        this.#observer = this.host.babylon.onPickedObservable.add(this.#onpick);
    }

    override dispose(): void {
        this.#observer.remove();
    }

    #onpick = (info: Nullable<PickingInfo>) => {
        this.host.target = info?.pickedMesh ?? null;
    };
}
