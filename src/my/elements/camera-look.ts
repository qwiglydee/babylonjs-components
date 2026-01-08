import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { type PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { type BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Vector3 } from "@babylonjs/core/Maths";
import { type Nullable } from "@babylonjs/core/types";
import { smoothFocus, smoothParams, smoothTarget } from "@lib/smoothcam";

import { CameraElemBase } from "../base/camera";
import { boundsCtx, pickCtx } from "../context";
import { type BoundsInfo } from "../interfaces";
import { type Polar, polarConverter } from "../properties/polar";

@customElement("my3d-camera-look")
export class LookCameraElem extends CameraElemBase<ArcRotateCamera> {
    @consume({ context: boundsCtx, subscribe: true })
    @state()
    _bounds: Nullable<BoundsInfo> = null;

    @consume({ context: pickCtx, subscribe: true })
    @state()
    _picked: Nullable<PickingInfo> = null;

    @property({ useDefault: true, converter: polarConverter })
    defaults: Polar = { a: 45, b: 45, r: 10};

    @property({ type: Boolean })
    autoZoom = false;

    override init() {
        const params = polarConverter.toCam(this.defaults)!;
        this._camera = new ArcRotateCamera("camera", params.alpha, params.beta, params.radius, Vector3.ZeroReadOnly, this.scene);
        this._camera.minZ = 0.001;
        this._camera.maxZ = 1000;
        this._camera.lowerRadiusLimit = 0.5 * params.radius;
        this._camera.upperRadiusLimit = 2 * params.radius;
        this._camera.useNaturalPinchZoom = true;
        this._camera.wheelDeltaPercentage = 0.01;
        super.init();
    }

    reset() {
        const { alpha, beta, radius } = polarConverter.toCam(this.defaults)!;
        smoothParams(this._camera!, {alpha, beta, radius, target: Vector3.Zero()});
    }

    override update(changes: PropertyValues) {
        if (changes.has("_picked") || changes.has("_bounds")) {
            if (this.main.model.isEmpty) {
                this.reset();
            } else if (this._picked?.pickedMesh) {
                this.#retarget(this._picked.pickedMesh.getBoundingInfo())
            } else if (this._bounds) {
                this.#retarget(this._bounds.model);
            }
        }
        super.update(changes);
    }

    #retarget(bounds: BoundingInfo) {
        if (this.autoZoom) smoothFocus(this._camera!, bounds);
        else smoothTarget(this._camera!, bounds.boundingSphere.centerWorld);
    }
}
