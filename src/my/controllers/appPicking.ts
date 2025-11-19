import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { debug } from "@utils/debug";
import { BabylonCtrl } from "./appCtrl";

export class PickingCtrl extends BabylonCtrl {
    init() {
        this.scene.onPointerObservable.add((info: PointerInfo) => {
            if (info.type == PointerEventTypes.POINTERTAP && info.pickInfo) {
                if (info.pickInfo?.pickedMesh) this.#pick(info.pickInfo); else this.#unpick();
            }
        });
    }

    dispose() {}

    #pick(info: PickingInfo) {
        if (this.host.picked?.pickedMesh !== info.pickedMesh) {
            debug(this, "picking", info);
            this.host.picked = info;
        }
    }

    #unpick() {
        if (this.host.picked !== null) {
            debug(this, "unpicking");
            this.host.picked = null;
        }
    }
}