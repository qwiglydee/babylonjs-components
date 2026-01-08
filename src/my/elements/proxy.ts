import { consume } from "@lit/context";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { Node as BabylonNode } from "@babylonjs/core/node";
import { assertNonNull } from "@utils/asserts";
import type { Nullable } from "@babylonjs/core/types";

import { ComponentElemBase } from "../base/elem";
import { modelCtx } from "../context";
import type { IModelContainer } from "../interfaces";

/**
 * An element that refers to a node in scene.
 * 
 * Setting disabled/hidden affects target node.
 */
@customElement("my3d-proxy")
export class MyProxyElem extends ComponentElemBase {
    /** context-provided container to search for target */
    @consume({ context: modelCtx, subscribe: true })
    @state({ hasChanged: () => true }) // do not compare
    model!: IModelContainer;

    /**
     * Id of target node
     */
    @property()
    for: string = "";
    
    @state()
    _target: Nullable<BabylonNode> = null;

    @property({ type: Boolean, reflect: false })
    set disabled(val: boolean) {
        this.enabled = !val;
    }
    get disabled(): boolean {
        return !this.enabled;
    }
    set enabled(val: boolean) {
        this.__enabled = val;
    }
    get enabled() {
        return this._target?.isEnabled() ?? this.__enabled;
    }
    @state()
    __enabled = true;

    @property({ type: Boolean, reflect: false })
    override set hidden(val: boolean) {
        this.visible = !val;
    }
    override get hidden(): boolean {
        return !this.visible;
    }
    set visible(val: boolean) {
        this.__visible = val;
    }
    get visible() {
        return this._target?.isVisible ?? this.__visible;
    }
    @state()
    __visible = true;

    override init() {
        this.#rettach();
        if (this._target) {
            // proxy created over already loaded model
            this._syncEnabled(this._target.isEnabled());
            this._syncVisible(this._target.isVisible);
        }
    }

    dispose() {
        this._target = null;
    }

    override willUpdate(changes: PropertyValues): void {
        if (changes.has('for') || changes.has('model')) this.#rettach();        
    }

    override update(changes: PropertyValues) {
        if (this._target) {
            if (changes.has('_target') || changes.has("__enabled")) this._syncEnabled(this.__enabled);
            if (changes.has('_target') || changes.has("__visible")) this._syncVisible(this.__visible);
        }
        super.update(changes);
    }

    #rettach() {
        this._target = this.for ? this.model.getMeshById(this.for) : null;
    }

    protected _syncEnabled(enabled: boolean) {
        assertNonNull(this._target);
        assertNonNull(enabled);
        this.toggleAttribute("disabled", !enabled); 
        this._target.setEnabled(enabled);
    }

    protected _syncVisible(enabled: boolean) {
        assertNonNull(this._target);
        assertNonNull(enabled);
        this.toggleAttribute("hidden", !enabled); 
        this._target.isVisible = enabled;
    }
}