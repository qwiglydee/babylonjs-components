import { customElement, property } from "lit/decorators.js";

import { AxesViewer } from "@babylonjs/core/Debug/axesViewer";
import { assertNonNull } from "@utils/asserts";

import { SceneElement } from "./elements";

@customElement("my3d-axes")
export class MyAxesElem extends SceneElement {
    @property({ type: Number })
    scale = 1;

    @property({ type: Number })
    thickness = 1;

    _axes!: AxesViewer;

    override init(): void {
        assertNonNull(this.scene);
        this._axes = new AxesViewer(this.scene, this.scale, undefined, undefined, undefined, undefined, this.thickness);
    }

    override dispose(): void {
        this._axes.dispose();
    }
}
