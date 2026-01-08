import type { PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { Tags } from "@babylonjs/core/Misc/tags";
import type { Node as BabylonNode } from "@babylonjs/core/node";
import { assertNonNull } from "@utils/asserts";

import { ComponentElemBase } from "./elem";

/**
 * Base of elements creating some nodes (transformnodes, meshes, lights)
 *
 * - saves element `id`
 * - saves classes as tags
 * - marks supplimental stuff with 'aux' tag
 * - synchronizes `disabled` with prop `enabled` and babylon `isEnabled`
 * - synchronizes `hidden` with prop `visible` and babylon `isVisible`
 */
export abstract class NodeElemBase<SomeNode extends BabylonNode> extends ComponentElemBase {
    /**
     * Identifies the class as auxiliary entities.
     * They got marked with 'aux' tag and excluded from some scene analyzis like bounds.
     */
    static auxiliary = false;

    /**
     * Hide component when disabled
     */
    static autoHide = true;

    @property()
    name: string = ""

    /**
     * Reference to a scene node representing some entity
     */
    _node?: SomeNode;


    @state()
    __enabled = true; // cached value until init or update

    /**
     * Common sense counterpart of `disabled`
     */
    set enabled(val: boolean) {
        this.__enabled = val;
    }
    get enabled() {
        return this._node?.isEnabled() ?? this.__enabled;
    }
    /**
     * Traditional DOM property and HTML attribute
     * Synchronized with babylon enabled state.
     */

    @property({ type: Boolean, reflect: false })
    set disabled(val: boolean) {
        this.enabled = !val;
    }
    get disabled(): boolean {
        return !this.enabled;
    }

    @state()
    __visible = true; // cached value until init or update

    /**
     * Common sense counterpart of `hidden`
     */
    set visible(val: boolean) {
        this.__visible = val;
    }
    get visible() {
        return this._node?.isVisible ?? this.__visible;
    }
    /**
     * Standard DOM property and HTML attribute
     * Synchronized with babylon enabled state. 
     */

    @property({ type: Boolean, reflect: false })
    override set hidden(val: boolean) {
        this.visible = !val;
    }
    override get hidden(): boolean {
        return !this.visible;
    }

    /**
     * Initialize the scene entity
     * 
     * Override the method to create and initialize `this._node`
     * Call to `supet.init()` to complete initialization.
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
     * Update the scene entity.
     * 
     * Override the method to update some properties.
     * Call to `super.update()` to complete updating.
     */
    override update(changes: PropertyValues) {
        if (changes.has("__enabled")) this._syncEnabled(this.__enabled);
        if (changes.has("__visible")) this._syncVisible(this.__visible);
        super.update(changes);
    }

    /**
     * Synchronize `enabled` property with `disabled` atribute and node state. 
     * It should make both sides.
     */
    protected _syncEnabled(enabled: boolean) {
        assertNonNull(this._node);
        assertNonNull(enabled);
        this.toggleAttribute("disabled", !enabled); 
        this._node.setEnabled(enabled);
        if ((this.constructor as typeof NodeElemBase<any>).autoHide) {
            this.visible = enabled;
        }
    }

    /**
     * Synchronize `visible` property with `hidden` atribute and node state. 
     * It should make both sides.
     */
    protected _syncVisible(enabled: boolean) {
        assertNonNull(this._node);
        assertNonNull(enabled);
        this.toggleAttribute("hidden", !enabled); 
        this._node.isVisible = enabled;
    }
}