import { Camera } from "@babylonjs/core/Cameras/camera";
import { BabylonController, type BabylonHost } from "./base";
import { debug } from "@utils/debug";

interface CameraHost extends BabylonHost {
    _camera: Camera;
}

export class CamDumbCtrl extends BabylonController<CameraHost> {
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
    };
}
