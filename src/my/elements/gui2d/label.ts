import { consume } from "@lit/context";
import type { PropertyValues } from "lit-element";
import { customElement, property, state } from "lit-element/decorators.js";

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

    _label!: MyLabel

    get valid(): boolean {
        return this.__target != null;
    }

    override init(): void {
        const label = new MyLabel("label", this.textContent.trim());

        this.applyStyle(label);
        this.applyStyle(label, ['offset']);
        this.applyStyle(label._textBlock!, TEXTSTYLES);
        this.applyStyle(label._textBlock!, COLORSTYLES);

        this.addControl(label);
        this._label = label;

        this._syncVisible(false);
        if (this.anchor) this.#rescan();
        if (this.valid) this.#rettach();
    }

    override update(changes: PropertyValues) {
        if (changes.has('anchor') || changes.has('model')) this.#rescan();
        if (changes.has('__target')) this.#rettach();
        this.visible = this.valid && this.__target!.isVisible;
        super.update(changes);
    }

    #rescan() {
        this.__target = this.anchor ? querySelectorNode(this.model, this.anchor) as TransformNode : null;
    }

    #rettach() {
        this._label.anchor.target = this.__target;
    }
}
