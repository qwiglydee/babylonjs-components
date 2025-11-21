import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Nullable } from "@babylonjs/core/types";

import { SceneElement } from "./elements";
import { CamDumbCtrl } from "./controllers/camDumb";
import { CamTargetCtrl } from "./controllers/camTarget";

@customElement("my3d-camera-basic")
export class MyBasicCameraElem extends SceneElement {
    @property({ type: Boolean })
    selected = false;

    @state()
    target: Nullable<AbstractMesh> = null;

    _camera!: UniversalCamera;

    _targetCtrl = new CamTargetCtrl(this);
    // _cameraCtrl = new CamDumbCtrl(this);

    override init(): void {
        this._camera = new UniversalCamera("(Camera)", Vector3.Backward(this.scene.useRightHandedSystem), this.scene);
        if (this.id) this._camera.id = this.id;
        this._camera.position.y = 1.75;
        this._camera.position.z = 2;
        this._camera.setEnabled(false);

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

        if (changes.has('target')) {
            this._camera.setTarget(this.target?.getAbsolutePosition() ?? Vector3.ZeroReadOnly);
        }
        super.update(changes);
    }
}
