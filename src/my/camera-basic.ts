import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Nullable } from "@babylonjs/core/types";

import { SceneElement } from "./base";
import { TargetingCtrl } from "./controllers/targetPicking";

@customElement("my3d-camera-basic")
export class MyBasicCameraElem extends SceneElement {
    @property({ type: Boolean, reflect: true })
    selected = false;

    @state()
    target: Nullable<AbstractMesh> = null;

    _camera!: UniversalCamera;

    _pickCtrl = new TargetingCtrl(this);
    // _cameraCtrl = new CamDumbCtrl(this);

    override init(): void {
        this._camera = new UniversalCamera(this.localName, Vector3.Backward(this.scene.useRightHandedSystem), this.scene);
        this._setId(this._camera);
        this._setTags(this._camera);
        this._camera.position.y = 1.75;
        this._camera.position.z = 2;
        this._camera.setEnabled(false);

        this._camera.onEnabledStateChangedObservable.add((e) => this.toggle(e));
        if (!this.scene.activeCamera) this.scene.activeCamera = this._camera;
    }

    override dispose(): void {
        this._camera.setEnabled(false);
        this._camera.dispose();
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(enabled, this._camera);

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
            this._camera.setTarget(this.target?.getAbsolutePosition() ?? Vector3.ZeroReadOnly);
        }
        super.update(changes);
    }
}
