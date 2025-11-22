import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import type { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Nullable } from "@babylonjs/core/types";
import { debug } from "@utils/debug";

import { BabylonController, type BabylonHost } from "./base";

interface PickingHost extends BabylonHost {
    picked: Nullable<PickingInfo>;
}

export class MoveingCtrl extends BabylonController<PickingHost> {
    dragBhv?: PointerDragBehavior;
    dragDist = 0;
    dragNormal = Vector3.UpReadOnly;

    init() {
        this.dragBhv = new PointerDragBehavior({ dragPlaneNormal: this.dragNormal });
        this.dragBhv.onDragStartObservable.add(() => {
            this.dragDist = 0;
        });
        this.dragBhv.onDragObservable.add((data: { dragDistance: number }) => {
            this.dragDist += data.dragDistance;
        });
        this.dragBhv.onDragEndObservable.add(() => {
            // @ts-ignore
            this.host._bounds_dirty = true;
        });
    }

    dispose() {
        this.dragBhv?.detach();
        delete this.dragBhv;
    }

    hostUpdate() {
        // NB: cannot use picked context consumer on the same element
        if (!this.dragBhv) return;
        if (this.host.picked?.pickedMesh) this.#pick(this.host.picked.pickedMesh);
        else this.#unpick();
    }

    #pick(mesh: AbstractMesh) {
        const same = this.dragBhv?.enabled && this.dragBhv?.attachedNode === mesh;

        debug(this, "picking", { mesh, same });
        if (!same) {
            this.dragBhv!.attach(mesh);
            this.dragBhv!.enabled = true;
        }
    }

    #unpick() {
        debug(this, "unpicking", this.dragBhv?.attachedNode);
        this.dragBhv!.detach();
        this.dragBhv!.enabled = false;
    }
}
