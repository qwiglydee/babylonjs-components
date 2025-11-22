import { ContextConsumer } from "@lit/context";

import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Nullable } from "@babylonjs/core/types";

import { pickCtx } from "../context";
import { BabylonController, type BabylonHost } from "./base";

export interface TargetingHost extends BabylonHost, HTMLElement {
    target: Nullable<AbstractMesh>;
}

export class TargetingCtrl extends BabylonController<TargetingHost> {
    _pickCtx!: ContextConsumer<typeof pickCtx, TargetingHost>;

    override init() {
        this._pickCtx = new ContextConsumer(this.host, { context: pickCtx, subscribe: true, callback: this.#onpick });
    }

    override dispose(): void {
        // consumer disposes itself
    }

    #onpick = (info: Nullable<PickingInfo>) => {
        this.host.target = info?.pickedMesh ?? null;
    };
}
