import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { debug } from "@utils/debug";
import { BabylonCtrl } from "./appCtrl";

export class MoveingCtrl extends BabylonCtrl{
    dragBhv!: PointerDragBehavior;
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
    }

    dispose() {}

    hostUpdate() {
        if (!this.dragBhv) return;
        if (this.host.picked?.pickedMesh) this.#pick(this.host.picked.pickedMesh);
        else this.#unpick();
    }

    #pick(mesh: AbstractMesh) {
        if (this.dragBhv.attachedNode !== mesh) {
            debug(this, "grabbing", mesh.id);
            this.dragBhv.attach(mesh);
        }
    }

    #unpick() {
        this.dragBhv.detach();
    }
}
