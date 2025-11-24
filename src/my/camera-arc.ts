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
import { SceneElement } from "./base";
import { debug } from "@utils/debug";

@customElement("my3d-camera-arc")
export class MyArcCameraElem extends SceneElement {
    @consume({ context: boundsCtx, subscribe: true })
    @state()
    bounds: Nullable<BoundsInfo> = null;

    @property({ type: Boolean, reflect: true })
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

    _pickCtrl = new TargetingCtrl(this);

    override init(): void {
        this._camera = new ArcRotateCamera(
            this.localName,
            Tools.ToRadians(this.defaultAlpha),
            Tools.ToRadians(this.defaultBeta),
            this.defaultRadius,
            Vector3.Zero(),
            this.scene
        );
        this._setId(this._camera);
        this._setTags(this._camera);
        this._camera.setEnabled(false);
        this._camera.minZ = 0.001;
        this._camera.maxZ = 1000;
        this._camera.lowerRadiusLimit = 0.5 * this.defaultRadius;
        this._camera.upperRadiusLimit = 2 * this.defaultRadius;
        this._camera.wheelDeltaPercentage = 0.01; // ??
        this._camera.useNaturalPinchZoom = true;

        // this._camera.inertia = 0.5;

        this._camera.onEnabledStateChangedObservable.add((e) => this.toggle(e));
        if (!this.scene.activeCamera) this.scene.activeCamera = this._camera;
    }

    override dispose(): void {
        this._camera.setEnabled(false);
        this._camera.dispose();
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(this._camera, enabled);

        if (enabled) {
            // this._camera.useAutoRotationBehavior = this.autoSpin;
            this._camera.attachControl();
        } else {
            // this._camera.useAutoRotationBehavior = false;
            this._camera.detachControl();
        }            
    }

    override update(changes: PropertyValues): void {
        if (changes.has("selected")) {
            if (this.selected) this.scene.activeCamera = this._camera;
        }

        if (changes.has("target") || changes.has("bounds")) {
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
