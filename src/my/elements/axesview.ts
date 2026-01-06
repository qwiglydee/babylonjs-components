import { customElement, property } from "lit/decorators.js";

import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";

import { BabylonComponentBase } from "../base/elem";

@customElement("my3d-axesview")
export class MyAxesviewElem extends BabylonComponentBase {
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
