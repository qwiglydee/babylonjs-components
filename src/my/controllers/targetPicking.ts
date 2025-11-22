import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Nullable } from "@babylonjs/core/types";
import { ContextConsumer } from "@lit/context";
import { pickCtx } from "../context";
import { BabylonController, BabylonControllerHost } from "./base";


export interface TargetedControllerHost extends BabylonControllerHost, HTMLElement {
    target: Nullable<AbstractMesh>;
}

export class TargetingCtrl extends BabylonController<TargetedControllerHost> {
    #consumer?: ContextConsumer<any, any>;

    override init() {
        this.#consumer = new ContextConsumer(this.host, { context: pickCtx, subscribe: true, callback: this.#onpick }) 
    }

    override dispose(): void {
        this.#consumer = undefined; // it disposes itself
    }

    #onpick = (info: Nullable<PickingInfo>) => {
        this.host.target = info?.pickedMesh ?? null;
    }
}