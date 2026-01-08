import { consume } from "@lit/context";
import { state } from "lit/decorators.js";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { ALLSTYLES, applyCSSOffset, applyCSSStyle } from "@lib/gui2/css";

import { guiCtx } from "../context";
import { ComponentElemBase } from "./elem";

export abstract class GUI2ComponentBase extends ComponentElemBase {
    @consume({ context: guiCtx, subscribe: false })
    gui!: AdvancedDynamicTexture;

    @state()
    enabled: boolean = true;

    get disabled() {
        return !this.enabled;
    }
    set disabled(val: boolean) {
        this.enabled = !val;
    }

    @state()
    visible: boolean = true;

    override get hidden() {
        return !this.visible;
    }
    override set hidden(val: boolean) {
        this.visible = !val;
    }

    addControl(ctrl: Control) {
        this.gui.addControl(ctrl);
    }

    applyStyle(ctrl: Control, keys: Set<string> | string[] = ALLSTYLES) {
        if(Array.isArray(keys)) keys = new Set(keys);
        applyCSSStyle(ctrl, this.style, keys);
        if (keys.has('offset') && this.style.position == 'relative') applyCSSOffset(ctrl, this.style);
    }

    _syncEnabled(enabled: boolean, ...objects: Control[]) {
        this.enabled = enabled;
        this.toggleAttribute('disabled', !enabled);
        objects.forEach((it) => (it.isEnabled = enabled));
    }

    _syncVisible(visible: boolean, ...controls: Control[]) {
        this.visible = visible;
        this.toggleAttribute('hidden', !visible);
        controls.forEach((it) => (it.isVisible = visible));
    }
}
