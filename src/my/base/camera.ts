import { PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { Camera } from "@babylonjs/core/Cameras/camera";
import { Observer } from "@babylonjs/core/Misc/observable";
import { assertNonNull } from "@utils/asserts";

import { BabylonComponentBase } from "./elem";
import { Tags } from "@babylonjs/core/Misc/tags";

/**
 * Base of elements for cameras.
 * Similar to SceneNodeElem, although not derived.
 *
 * - saves element `id`
 * - synchronizes `selected` with scene active camera
 * - synchronozes `disabled` with isEnabled and control attachment
 *
 * (but not automatically disabled when deactivated)
 */
export abstract class SceneCameraElemBase<SomeCamera extends Camera> extends BabylonComponentBase {
    /**
     * Enable/disable the camera when activated/deactivated.
     */
    static autoEnable = true;

    /**
     * Attach/detach controls when enabled/disabled.
     */
    static autoAttach = true;

    /**
     * Reference to a camera
     */
    _camera?: SomeCamera;

    @state()
    __selected = false; // cached value until init or update

    /**
     * Standard DOM property and HTML attribute
     * Synchronized with scene active camera
     */
    @property({ type: Boolean, reflect: false })
    set selected(val: boolean) {
        this.__selected = val;
    }
    get selected(): boolean {
        return this.scene && this._camera ? this.scene.activeCamera === this._camera : this.__selected;
    }

    @state()
    __enabled = false; // cached value until init or update

    set enabled(val: boolean) {
        this.__enabled = val;
    }
    get enabled() {
        return this._camera?.isEnabled() ?? this.__enabled;
    }

    @property({ type: Boolean, reflect: false })
    set disabled(val: boolean) {
        this.enabled = !val;
    }
    get disabled(): boolean {
        return !this.enabled;
    }

    #observer!: Observer<any>;

    override init() {
        assertNonNull(this._camera, "Not iitialized");

        if (this.id) this._camera.id = this.id;
        Tags.AddTagsTo(this._camera, this.classList.value);

        this._syncSelected(this.__selected);
        this._syncEnabled(this.__enabled);

        this.#observer = this.scene.onActiveCameraChanged.add(() => {
            this._syncSelected(this.scene.activeCamera === this._camera);
        });
    }

    dispose() {
        this.#observer?.remove();
        this._camera?.dispose();
    }

    override update(changes: PropertyValues) {
        if (changes.has("__selected")) this._syncSelected(this.__selected);
        if (changes.has("__enabled")) this._syncEnabled(this.__enabled);
        super.update(changes);
    }

    protected _syncSelected(selected: boolean) {
        assertNonNull(this._camera);
        assertNonNull(selected);
        this.toggleAttribute("selected", selected);
        if (selected) this.scene.activeCamera = this._camera;
        if ((this.constructor as typeof SceneCameraElemBase<SomeCamera>).autoEnable) {
            this.enabled = selected;
        }
    }

    protected _syncEnabled(enabled: boolean) {
        assertNonNull(this._camera);
        assertNonNull(enabled);
        this.toggleAttribute("disabled", !enabled);
        this._camera.setEnabled(enabled);
        if ((this.constructor as typeof SceneCameraElemBase<SomeCamera>).autoAttach) {
            if (enabled) {
                this._camera.attachControl();
            } else {
                this._camera.detachControl();
            }
        }
    }
}
