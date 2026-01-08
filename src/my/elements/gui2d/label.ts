import { consume } from "@lit/context";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Nullable } from "@babylonjs/core/types";
import { COLORSTYLES, TEXTSTYLES } from "@lib/gui2/css";
import { MyLabel } from "@lib/gui2/label";
import { querySelectorNode } from "@lib/queryselecting";

import { GUI2ComponentBase } from "../../base/gui2";
import { modelCtx } from "../../context";
import type { IModelContainer } from "../../interfaces";

@customElement("my2g-label")
export class MyGUILabelElem extends GUI2ComponentBase {
    @consume({ context: modelCtx, subscribe: true })
    @state({ hasChanged: () => true }) // do not compare
    model!: IModelContainer;

    @property()
    anchor = "";

    @state()
    __target: Nullable<TransformNode> = null;

    get valid(): boolean {
        return this.__target != null;
    }

    _label!: MyLabel;

    override init(): void {
        this._label = new MyLabel("label", this.textContent.trim());

        this.applyStyle(this._label);
        this.applyStyle(this._label, ['offset']);
        this.applyStyle(this._label._textBlock!, TEXTSTYLES);
        this.applyStyle(this._label._textBlock!, COLORSTYLES);

        this.addControl(this._label);

        this._syncVisible(false, this._label);
        if (this.anchor) this.#rescan();
        if (this.valid) this.#rettach();
    }

    override dispose(): void {
        this._label.dispose()
    }

    override update(changes: PropertyValues) {
        if (changes.has('anchor') || changes.has('model')) this.#rescan();
        if (changes.has('__target')) {
            if (this.valid) this.#rettach();
            else this.#reset();
        }
        this.visible = this.valid && this.__target!.isVisible;
        
        if (changes.has("enabled")) this._syncEnabled(this.enabled, this._label);
        if (changes.has("visible")) this._syncVisible(this.visible, this._label);
        super.update(changes);
    }

    #rescan() {
        this.__target = this.anchor ? querySelectorNode(this.model, this.anchor) as TransformNode : null;
    }

    #reset() {
        this._label.anchor.unlink();
    }

    #rettach() {
        this._label.anchor.target = this.__target;
    }
}
