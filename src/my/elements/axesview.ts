import { customElement, property } from "lit-element/decorators.js";

import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";

import { ComponentElemBase } from "../base/component";

@customElement("b3d-axesview")
export class AxesviewElem extends ComponentElemBase {
    @property({ type: Number })
    scale = 1;

    @property({ type: Number })
    thickness = 1;

    _axes!: AxesViewer;

    override init() {
        this._axes = new AxesViewer(this.scene, this.scale, undefined, undefined, undefined, undefined, this.thickness);
    }

    override dispose() {
        this._axes.dispose();
    }
}
