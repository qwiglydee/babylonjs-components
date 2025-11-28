import { consume } from "@lit/context";
import { PropertyValues, ReactiveElement } from "lit";
import { property } from "lit/decorators.js";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { babylonCtx, IBabylonElem } from "../context";
import { guiCtx } from "./context";
import { debug } from "@utils/debug";
import { applyCSSStyle } from "./css";

export abstract class GUI2Element extends ReactiveElement {
    protected override createRenderRoot() {
        return this;
    }

    @consume({ context: babylonCtx, subscribe: false })
    babylon!: IBabylonElem;

    @consume({ context: guiCtx, subscribe: false })
    gui!: AdvancedDynamicTexture;

    _addControl(ctrl: Control) {
        this.gui.addControl(ctrl);
    }

    @property({ type: Boolean, reflect: true })
    disabled = false;

    get enabled() {
        return !this.disabled;
    }
    set enabled(val: boolean) {
        this.disabled = !val;
    }

    _syncEnabled(enabled: boolean, ...objects: Control[]) {
        this.enabled = enabled;
        objects.forEach((it) => (it.isEnabled = enabled));
    }

    @property({ type: Boolean, reflect: true })
    override hidden = false;

    get visible() {
        return !this.hidden;
    }
    set visible(val: boolean) {
        this.hidden = !val;
    }

    _syncVisible(visible: boolean, ...controls: Control[]) {
        this.visible = visible;
        controls.forEach((it) => (it.isVisible = visible));
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this.init();
        debug(this, "style", this.style);
    }

    override disconnectedCallback(): void {
        this.dispose();
        super.disconnectedCallback();
    }

    override willUpdate(changes: PropertyValues) {
        if (changes.has("disabled")) this.toggle(this.enabled);
        if (changes.has("hidden")) this.toggleVisible(this.visible);
    }

    abstract init(): void;
    abstract dispose(): void;
    abstract toggle(enabled: boolean): void;
    abstract toggleVisible(visible: boolean): void;

    _applyStyle(ctrl: Control, keys?: string[]) {
        applyCSSStyle(ctrl, this.style, keys);
    }
}
