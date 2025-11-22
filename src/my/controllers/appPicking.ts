import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { PointerEventTypes, PointerInfo } from "@babylonjs/core/Events/pointerEvents";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Nullable } from "@babylonjs/core/types";

import { BabylonController, type BabylonHost } from "./base";

interface PickingHost extends BabylonHost {
    picked: Nullable<PickingInfo>;
}

export class PickingCtrl extends BabylonController<PickingHost> {
    #observers: any[] = [];

    init() {
        this.#observers.push(
            this.scene.onPointerObservable.add((info: PointerInfo) => {
                if (info.type == PointerEventTypes.POINTERTAP && info.pickInfo) {
                    if (info.pickInfo?.pickedMesh) this.#pick(info.pickInfo);
                    else this.#unpick();
                }
            })
        );
        this.#observers.push(
            this.scene.onMeshRemovedObservable.add((mesh: AbstractMesh) => {
                if (mesh === this.host.picked?.pickedMesh) this.#unpick();
            })
        );
    }

    dispose() {
        this.#observers.forEach((o) => o.remove());
    }

    #pick(info: PickingInfo) {
        if (this.host.picked?.pickedMesh !== info.pickedMesh) {
            this.host.picked = info;
        }
    }

    #unpick() {
        if (this.host.picked !== null) {
            this.host.picked = null;
        }
    }
}
