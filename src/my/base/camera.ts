import { type PropertyValues } from "lit-element";
import { property, state } from "lit-element/decorators.js";

import { Camera } from "@babylonjs/core/Cameras/camera";
import { Observer } from "@babylonjs/core/Misc/observable";
import { Tags } from "@babylonjs/core/Misc/tags";
import { assertNonNull } from "@utils/asserts";

import { ComponentElemBase } from "./component";

/**
 * Base for camera components.
 * Similar to NodeElemeBase.
 * 
 * Expects `init` in subclass to create some actual camera.
 * 
 * - saves element `id` and `name`
 * - saves `class` as tags
 * 
 * - synchronizes attribute/property `disabled`/`enabled` with babylon `isEnabled`
 * - attaches and detaches controls when disabled/enabled 
 * - synchronizes attribute/property `selected` with state of scene active camera
 */
export abstract class CameraElemBase<SomeCamera extends Camera> extends ComponentElemBase {
    /**
     * Auto enable/disable the camera when activated/deactivated.
     */
    static autoEnable = true;

    /**
     * Auto attach/detach controls when enabled/disabled.
     */
    static autoAttach = true;

    /**
     * Name, translated to underlying node name
     */
    @property()
    name: string = ""

    /**
     * Reference to a babylon camera
     */
    _camera?: SomeCamera;


    /**
     * State of enabled.
     *
     * Setting the property schedules synchronization
     * Getting the property retrieves actual node state
     */
    set enabled(val: boolean) {
        this.__enabled = val;
    }
    get enabled() {
        return this._camera?.isEnabled() ?? this.__enabled;
    }
    @state()
    __enabled = true; // cached value until init or update

    /**
     * Counterpart of `enabled`
     * A standard DOM property and HTML attribute.
     * 
     * The attribute reflects the `enabled` state.
     * It also reflects state change from within babylon.
     */
    @property({ type: Boolean, reflect: false })
    set disabled(val: boolean) {
        this.enabled = !val;
    }
    get disabled(): boolean {
        return !this.enabled;
    }


    /**
     * State of being active camera.
     *
     * Setting the property to true schedules switching camera
     * Getting the property retrieves actual camera state
     * 
     * The attribute reflects actual camera state.
     */
    @property({ type: Boolean, reflect: false })
    set selected(val: boolean) {
        this.__selected = val;
    }
    get selected(): boolean {
        return this.scene && this._camera ? this.scene.activeCamera === this._camera : this.__selected;
    }
    @state()
    __selected = false; // cached value until init or update

    ////

    #observer!: Observer<any>;

    /**
     * Initialize the babylon camera
     * 
     * Called right after element is created and connected to parent.
     * All element properties are already initialized to default values or parsed attributes.
     * 
     * Override to implement actual camera creation.
     * Call to `super.init()` to complete initialization
     */
    override init() {
        assertNonNull(this._camera, "Not iitialized");

        if (this.id) this._camera.id = this.id;
        if (this.name && !this._camera.name) this._camera.name = this.name; 
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

    /**
     * Update the babylon camera
     * 
     * Called when properties change.
     * Not called for initial/default values.
     *
     * Override the method to change underlying babylon entities.
     * Call to `super.update()` to complete updating and perform enabled/selected sync.
     */
    override update(changes: PropertyValues) {
        if (changes.has("__selected")) this._syncSelected(this.__selected);
        if (changes.has("__enabled")) this._syncEnabled(this.__enabled);
        super.update(changes);
    }

    /**
     * Synchronize `enabled` state to babylon state and html attribute
     * 
     * If class has `autoAttach = true` it also attaches/detaches control.   
     */
    protected _syncEnabled(enabled: boolean) {
        assertNonNull(this._camera);
        assertNonNull(enabled);
        this.toggleAttribute("disabled", !enabled);
        this._camera.setEnabled(enabled);
        if ((this.constructor as typeof CameraElemBase<SomeCamera>).autoAttach) {
            if (enabled) {
                this._camera.attachControl();
            } else {
                this._camera.detachControl();
            }
        }
    }
    /**
     * Synchronize `selected` state to babylon active camera and html attribute
     * 
     * If class has `autoEnable = true` it also enables/disables the camera   
     */
    protected _syncSelected(selected: boolean) {
        assertNonNull(this._camera);
        assertNonNull(selected);
        this.toggleAttribute("selected", selected);
        if (selected) this.scene.activeCamera = this._camera;
        if ((this.constructor as typeof CameraElemBase<SomeCamera>).autoEnable) {
            this.enabled = selected;
        }
    }

}
