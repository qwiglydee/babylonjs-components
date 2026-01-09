import { consume } from "@lit/context";
import type { PropertyValues } from "lit-element";
import { state } from "lit-element/decorators.js";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { ALLSTYLES, applyCSSOffset, applyCSSStyle } from "@lib/gui2/css";

import { guiCtx } from "../context";
import { ComponentElemBase } from "./component";

export abstract class GUI2ComponentBase extends ComponentElemBase {
    @consume({ context: guiCtx, subscribe: false })
    gui!: AdvancedDynamicTexture;

    /**
     * Enablity state.
     * (write/only)
     */
    @state()
    enabled: boolean = true;

    get disabled() {
        return !this.enabled;
    }
    set disabled(val: boolean) {
        this.enabled = !val;
    }

    /**
     * Visibility state.
     * (write/only)
     */
    @state()
    visible: boolean = true;

    override get hidden() {
        return !this.visible;
    }
    override set hidden(val: boolean) {
        this.visible = !val;
    }

    /**
     * list of all (top-level) controls under this component
     */
    _controls: Control[] = [];

    /**
     * add a (top-level) control to the component and gui
     */
    addControl(ctrl: Control) {
        this._controls.push(ctrl);
        this.gui.addControl(ctrl);
    }

    addControls(...ctrls: Control[]) {
        this._controls.push(...ctrls);
        ctrls.forEach(_ => this.gui.addControl(_));
    }

    applyStyle(ctrl: Control, keys: Set<string> | string[] = ALLSTYLES) {
        if(Array.isArray(keys)) keys = new Set(keys);
        applyCSSStyle(ctrl, this.style, keys);
        if (keys.has('offset') && this.style.position == 'relative') applyCSSOffset(ctrl, this.style);
    }

    override dispose(): void {
        this._controls.forEach(_ => _.dispose())
        this._controls.length = 0;
    }


    override update(changes: PropertyValues): void {
        if (changes.has('enabled')) this._syncEnabled(this.enabled);
        if (changes.has('visible')) this._syncVisible(this.visible);
        super.update(changes);
    }

    /**
     * Synchronize component state with element attribute and control state 
     * @internal
     */
    _syncEnabled(enabled: boolean) {
        this.enabled = enabled;
        this.toggleAttribute('disabled', !enabled);
        this._controls.forEach(_ => (_.isEnabled = enabled));
    }

    /**
     * Synchronize component state with element attribute and control state 
     * @internal
     */
    _syncVisible(enabled: boolean) {
        this.visible = enabled;
        this.toggleAttribute('hidden', !enabled);
        this._controls.forEach(_ => (_.isVisible = enabled));
    }
}
