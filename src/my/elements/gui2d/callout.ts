import { consume } from "@lit/context";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Nullable } from "@babylonjs/core/types";
import { RadialGradient } from "@babylonjs/gui/2D/controls/gradient/RadialGradient";
import { MyCalloutLabel, MyCalloutLine } from "@lib/gui2/callout";
import { COLORSTYLES, DRAWSTYLES, TEXTSTYLES } from "@lib/gui2/css";
import { querySelectorNode } from "@lib/queryselecting";
import { formatCSSColor, parseCSSColor } from "@utils/colors";

import { GUI2ComponentBase } from "../../base/gui2";
import { modelCtx } from "../../context";
import type { IModelContainer } from "../../interfaces";

@customElement("my2g-callout")
export class MyGUICalloutElem extends GUI2ComponentBase {
    @consume({ context: modelCtx, subscribe: true })
    @state({ hasChanged: () => true }) // do not compare
    model!: IModelContainer;

    @property()
    anchor = "";

    @state()
    __target: Nullable<TransformNode> = null;

    @property({ type: Boolean })
    edge = false;

    _label!: MyCalloutLabel;
    _line!: MyCalloutLine;

    override init(): void {
        this._label = new MyCalloutLabel("label", this.textContent.trim());
        this._label.zIndex = 2;
        this._label.edge = this.edge;
        this._line = new MyCalloutLine("line");
        this._label.zIndex = 1;

        this.applyStyle(this._label);
        this.applyStyle(this._label, ["offset"]);
        this.applyStyle(this._label._textBlock!, TEXTSTYLES);
        this.applyStyle(this._label._textBlock!, COLORSTYLES);
        this.applyStyle(this._label._textBlock!, ["padding"]);
        this.applyStyle(this._line, DRAWSTYLES);

        const gradient = new RadialGradient(0, 0, 0, 0, 0, 128);
        const color = parseCSSColor(this._line.color);
        gradient.addColorStop(0.0, formatCSSColor({ ...color, a: 0.0 }));
        gradient.addColorStop(1.0, formatCSSColor({ ...color, a: 1.0 }));
        this._line.gradient = gradient;

        this.addControl(this._label);
        this.addControl(this._line);
        this._line.anchor2.target = this._label;
    }

    override update(changes: PropertyValues) {
        if (changes.has("anchor") || changes.has("model")) this.#rescan();
        if (changes.has("__target")) {
            this.visible = this.__target !== null && this.__target.isVisible;
            this.#rettach();
        }
        if (changes.has("edge")) this._label.edge = this.edge;

        super.update(changes);
    }

    #rescan() {
        this.__target = this.anchor ? (querySelectorNode(this.model, this.anchor) as TransformNode) : null;
    }

    #rettach() {
        this._label.anchor.target = this.__target;
        this._line.anchor1.target = this.__target;
    }
}
