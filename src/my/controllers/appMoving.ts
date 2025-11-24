import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

import { IBabylonElem } from "../context";
import { BabylonController } from "./base";
import { Nullable } from "@babylonjs/core/types";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";


export class MoveingCtrl extends BabylonController<IBabylonElem> {
    dragBhv?: PointerDragBehavior;
    dragDist = 0;
    dragNormal = Vector3.UpReadOnly;

    #observer?: any;

    init() {
        this.dragBhv = new PointerDragBehavior({ dragPlaneNormal: this.dragNormal });
        this.dragBhv.onDragStartObservable.add(() => {
            this.dragDist = 0;
        });
        this.dragBhv.onDragObservable.add((data: { dragDistance: number }) => {
            this.dragDist += data.dragDistance;
        });
        this.dragBhv.onDragEndObservable.add(() => {
            this.host.requestUpdate('scene');
        });
        this.#observer = this.host.onPickedObservable.add(this.#onpicking);
    }

    dispose() {
        this.#observer.remove();
        this.dragBhv?.detach();
        delete this.dragBhv;
    }
    
    #onpicking = (info: Nullable<PickingInfo>) => {
        if (info?.pickedMesh) this.#pick(info.pickedMesh);
        else this.#unpick();
    }

    #pick(mesh: AbstractMesh) {
        const same = this.dragBhv?.enabled && this.dragBhv?.attachedNode === mesh;
        if (!same) {
            this.dragBhv!.attach(mesh);
            this.dragBhv!.enabled = true;
        }
    }

    #unpick() {
        this.dragBhv!.detach();
        this.dragBhv!.enabled = false;
    }
}
