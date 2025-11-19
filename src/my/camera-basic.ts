import { consume } from "@lit/context";
import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { assertNonNull } from "@utils/asserts";
import { debug } from "@utils/debug";
import { VirtualElement } from "@utils/element";

import { sceneCtx } from "./context";

@customElement("my3d-camera-basic")
export class MyBasicCameraElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    @property({ type: Boolean })
    selected = false;

    @state()
    target: Nullable<AbstractMesh> = null;

    _camera!: UniversalCamera;

    override connectedCallback(): void {
        super.connectedCallback();
        assertNonNull(this.scene);
        this.#init();

        // prevent controls when not rendering
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

    #init() {
        debug(this, "initilizing");
        this._camera = new UniversalCamera("(Camera)", Vector3.Backward(this.scene.useRightHandedSystem), this.scene);
        this._camera.position.y = 1.75;
        this._camera.setEnabled(false);
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
