import { consume } from "@lit/context";
import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Tools } from "@babylonjs/core/Misc/tools";
import { Nullable } from "@babylonjs/core/types";

import { smoothFocus, smoothParams, smoothTarget } from "../lib/smoothcam";
import { boundsCtx, BoundsInfo } from "./context";
import { TargetingCtrl } from "./controllers/targetPicking";
import { SceneElement } from "./elements";

@customElement("my3d-camera-arc")
export class MyArcCameraElem extends SceneElement {
    @consume({ context: boundsCtx, subscribe: true })
    @state()
    bounds: Nullable<BoundsInfo> = null;

    @property({ type: Boolean })
    selected = false;

    @state()
    target: Nullable<AbstractMesh> = null;

    @property({ type: Boolean })
    autoZoom = false;

    @property({ type: Number })
    defaultAlpha: number = 45;

    @property({ type: Number })
    defaultBeta: number = 45;

    @property({ type: Number })
    defaultRadius: number = 10;

    _camera!: ArcRotateCamera;

    #pickCtrl = new TargetingCtrl(this);

    override init(): void {
        this._camera = new ArcRotateCamera(
            "(Camera)",
            Tools.ToRadians(this.defaultAlpha),
            Tools.ToRadians(this.defaultBeta),
            this.defaultRadius,
            Vector3.Zero(),
            this.scene
        );
        if (this.id) this._camera.id = this.id;
        this._camera.setEnabled(false);
        this._camera.minZ = 0.001;
        this._camera.maxZ = 1000;
        this._camera.lowerRadiusLimit = 0.5 * this.defaultRadius;
        this._camera.upperRadiusLimit = 2 * this.defaultRadius;
        this._camera.wheelDeltaPercentage = 0.01; // ??
        this._camera.useNaturalPinchZoom = true;

        // this._camera.inertia = 0.5;

        this._camera.onEnabledStateChangedObservable.add(() => {
            if (this._camera.isEnabled()) {
                // this._camera.useAutoRotationBehavior = this.autoSpin;
                this._camera.attachControl();
            } else {
                // this._camera.useAutoRotationBehavior = false;
                this._camera.detachControl();
            }
        });

        if (!this.scene.activeCamera) this.scene.activeCamera = this._camera;
    }

    override dispose(): void {
        this._camera.setEnabled(false);
        this._camera.dispose();
    }

    override update(changes: PropertyValues): void {
        if (changes.has("selected")) {
            if (this.selected) {
                this.scene.activeCamera = this._camera;
                this._camera.setEnabled(true);
            } else this._camera.setEnabled(false);
        }

        if (changes.has("target")) {
            let bounds = this.target ? this.target.getBoundingInfo() : this.bounds ? this.bounds.model : null;
            if (bounds) {
                if (this.autoZoom) smoothFocus(this._camera, bounds);
                else smoothTarget(this._camera, bounds.boundingSphere.centerWorld);
            } else {
                smoothParams(this._camera, {
                    alpha: Tools.ToRadians(this.defaultAlpha),
                    beta: Tools.ToRadians(this.defaultBeta),
                    radius: this.defaultRadius,
                    target: Vector3.Zero(),
                })
            }
        }

        super.update(changes);
    }
}
