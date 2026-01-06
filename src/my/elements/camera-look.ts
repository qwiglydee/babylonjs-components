import { consume } from "@lit/context";
import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Nullable } from "@babylonjs/core/types";
import { smoothFocus, smoothParams, smoothTarget } from "@lib/smoothcam";

import { SceneCameraElemBase } from "../base/camera";
import { boundsCtx, BoundsInfo } from "../context";
import { Polar, polarConverter } from "../properties/polar";
import { TargetingCtrl } from "../controllers/targeting";

@customElement("my3d-camera-look")
export class MyLookCameraElem extends SceneCameraElemBase<ArcRotateCamera> {
    @consume({ context: boundsCtx, subscribe: true })
    @state()
    _bounds: Nullable<BoundsInfo> = null;

    @property({ useDefault: true, converter: polarConverter })
    defaults: Polar = { a: 45, b: 45, r: 10};

    @state()
    _target: Nullable<Mesh> = null;
    #targetingCtrl = new TargetingCtrl(this);

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
        if (changes.has("_target") || changes.has("_bounds")) {
            let bounds = this._target ? this._target.getBoundingInfo() : this._bounds ? this._bounds.model : null;
            if (bounds) {
                if (this.autoZoom) smoothFocus(this._camera!, bounds);
                else smoothTarget(this._camera!, bounds.boundingSphere.centerWorld);
            } else {
                this.reset();
            }
        }
        super.update(changes);
    }
}
