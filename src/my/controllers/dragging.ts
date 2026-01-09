import type { ReactiveElement } from "lit-element";

import { PointerDragBehavior } from "@babylonjs/core/Behaviors/Meshes/pointerDragBehavior";
import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { Vector3 } from "@babylonjs/core/Maths/math";
import type { Nullable } from "@babylonjs/core/types";

import { BabylonControllerBase } from "./base";

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
            this.host.requestUpdate('model');
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
        this.dragBhv.attach(info.pickedMesh!);
    }

    unpick() {
        this.dragBhv.detach();
    } 
}