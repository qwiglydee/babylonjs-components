import { Camera } from "@babylonjs/core/Cameras/camera";
import { BabylonController, BabylonControllerHost } from "./base";
import { debug } from "@utils/debug";

export interface CameraControllerHost extends BabylonControllerHost {
    _camera: Camera;
}

export class CamDumbCtrl extends BabylonController<CameraControllerHost> {

    #observer: any;

    override init() {
        debug(this, "init");
        this.#observer = this.host._camera.onEnabledStateChangedObservable.add(this.#ontoggle);
    }

    override dispose(): void {
        this.#observer?.remove();
        debug(this, "dispose");        
    }

    #ontoggle = (enabled: boolean) => {
        debug(this, "toggled", { cam: this.host._camera.id, enabled });
    }
}