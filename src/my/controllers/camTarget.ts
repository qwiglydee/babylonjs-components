import { Camera } from "@babylonjs/core/Cameras/camera";
import { BabylonController, BabylonControllerHost } from "./base";
import { debug } from "@utils/debug";
import { ContextConsumer } from "@lit/context";
import { pickCtx } from "../context";
import { TargetCamera } from "@babylonjs/core/Cameras/targetCamera";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { Nullable } from "@babylonjs/core/types";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";


export interface CameraControllerHost extends BabylonControllerHost, HTMLElement {
    target: Nullable<AbstractMesh>;
    _camera: TargetCamera;
}

export class CamTargetCtrl extends BabylonController<CameraControllerHost> {
    #consumer?: ContextConsumer<any, any>;

    override init() {
        debug(this, "init");
        this.#consumer = new ContextConsumer(this.host, { context: pickCtx, subscribe: true, callback: this.#onpick }) 
    }

    override dispose(): void {
        debug(this, "dispose");        
        this.#consumer = undefined; // it disposes itself
    }

    #onpick = (info: Nullable<PickingInfo>) => {
        // debug(this, "picked", { cam: this.host._camera.id, mesh: info?.pickedMesh?.id })
        this.host.target = info?.pickedMesh ?? null;
    }
}