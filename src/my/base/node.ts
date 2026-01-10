import { type PropertyValues } from "lit-element";
import { property, state } from "lit-element/decorators.js";

import { Tags } from "@babylonjs/core/Misc/tags";
import type { Node as BabylonNode } from "@babylonjs/core/node";
import { assertNonNull } from "@utils/asserts";

import { ComponentElemBase } from "./component";

/**
 * Base for components wrapping some babylon scene node
 *
 * Expects `init` in subclass to create some actual node instance
 *
 * - saves element `id` and `name`
 * - saves `class` as tags
 * - optionally adds 'aux' tag for supplemential stuff
 *
 * - synchronizes attribute/property `disabled`/`enabled` with babylon `isEnabled`
 * - synchronizes attribute/property `hidden`/`visible` with babylon `isVisible`
 */
export abstract class NodeElemBase<SomeNode extends BabylonNode> extends ComponentElemBase {
    /**
     * Identifies the class as auxiliary entities.
     * They got marked with 'aux' tag and excluded from some scene analysis like bounds.
     */
    static auxiliary = false;

    /**
     * Automatically make disabled components hidden
     */
    static autoHide = true;

    /**
     * Name, translated to underlying node name
     */
    @property()
    name: string = "";

    /**
     * Reference to a babylon scene node
     */
    _node?: SomeNode;

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
        return this._node?.isEnabled() ?? this.__enabled;
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
     * State of visible.
     *
     * Setting the property schedules synchronization
     * Getting the property retrieves actual node state
     */
    set visible(val: boolean) {
        this.__visible = val;
    }
    get visible() {
        return this._node?.isVisible ?? this.__visible;
    }
    @state()
    __visible = true; // cached value until init or update

    /**
     * Counterpart of `visible`
     * A standard DOM property and HTML attribute
     * 
     * The attribute reflects the `visible` state.
     * But it doesn't reflect state change from within babylon.
     */
    @property({ type: Boolean, reflect: false })
    override set hidden(val: boolean) {
        this.visible = !val;
    }
    override get hidden(): boolean {
        return !this.visible;
    }

    /**
     * Initialize the babylon stuff
     * 
     * Called right after element is created and connected to parent.
     * All element properties are already initialized to default values or parsed attributes.
     * 
     * Override to implement actual node creation.
     * Call to `super.init()` to complete initialization
     */
    override init() {
        assertNonNull(this._node, "Not initialized");

        if (this.id) this._node.id = this.id;
        if (this.name && !this._node.name) this._node.name = this.name;
        if ((this.constructor as typeof NodeElemBase).auxiliary) {
            Tags.AddTagsTo(this._node, "aux");
        } else if (this.classList.length) {
            Tags.AddTagsTo(this._node, this.classList.value);
        }

        this._syncEnabled(this.__enabled);
        this._syncVisible(this.__visible);

        this._node.onEnabledStateChangedObservable.add((enabled) => this._syncEnabled(enabled));
        // alas, no observable for visibility
    }

    dispose() {
        this._node?.dispose();
    }

    /**
     * Update the babylon stuff
     * 
     * Called when properties change.
     * Not called for initial/default values.
     *
     * Override the method to change underlying babylon entities.
     * Call to `super.update()` to complete updating and perform enabled/visible sync.
     */
    override update(changes: PropertyValues) {
        if (changes.has("__enabled")) this._syncEnabled(this.__enabled);
        if (changes.has("__visible")) this._syncVisible(this.__visible);
        super.update(changes);
    }

    /**
     * Synchronize `enabled` state to babylon state and html attribute
     * 
     * If class has `autoHide = true` it also marks component hidden when disabled   
     */
    protected _syncEnabled(enabled: boolean) {
        assertNonNull(this._node);
        assertNonNull(enabled);
        this.toggleAttribute("disabled", !enabled);
        this._node.setEnabled(enabled);
        if (!enabled && (this.constructor as typeof NodeElemBase<any>).autoHide) {
            this.visible = false;
        }
    }

    /**
     * Synchronize `visible` state to babylon state and html attribute
     */
    protected _syncVisible(enabled: boolean) {
        assertNonNull(this._node);
        assertNonNull(enabled);
        this.toggleAttribute("hidden", !enabled);
        this._node.isVisible = enabled;
    }
}
