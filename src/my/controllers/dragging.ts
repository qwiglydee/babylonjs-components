import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { ReactiveElement } from "lit";

import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Nullable } from "@babylonjs/core/types";
import { BabylonControllerBase } from "./base";
import { debug } from "@utils/debug";

interface PickingHost extends ReactiveElement {
    picked: Nullable<PickingInfo>;
}

export class DraggingCtrl extends BabylonControllerBase<PickingHost> {
    dragBhv: PointerDragBehavior;
    dragDist = 0;
  
    get enabled(): boolean {
        return this.dragBhv.enabled ?? false;
    }
    set enabled(val: boolean) {
        this.dragBhv.enabled = val;
    }

    constructor(host: PickingHost, normal?: Vector3) {
        super(host);
        this.dragBhv = new PointerDragBehavior({ dragPlaneNormal: normal ?? Vector3.UpReadOnly });
        this.dragBhv.onDragStartObservable.add(() => {
            this.dragDist = 0;
        });
        this.dragBhv.onDragObservable.add((data: { dragDistance: number }) => {
            this.dragDist += data.dragDistance;
        });
        this.dragBhv.onDragEndObservable.add(() => {
            this.host.requestUpdate('scene');
        });
    }

    init() {
    }

    dispose() {
        this.dragBhv?.detach();
        this.dragBhv.enabled = false;
    }

    override hostUpdated(): void {
        if (this.host.picked?.pickedMesh !== this.dragBhv.attachedNode) {
            if (this.host.picked?.pickedMesh) this.pick(this.host.picked);
            else this.unpick();
        }
    }

    pick(info: PickingInfo) {
        debug(this, "picking", info.pickedMesh);
        this.dragBhv.attach(info.pickedMesh!);
    }

    unpick() {
        debug(this, "unpicking", this.dragBhv.attachedNode);
        this.dragBhv.detach();
    } 
}