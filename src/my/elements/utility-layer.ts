import { provide } from "@lit/context";
import { customElement, property } from "lit/decorators.js";

import { UtilityLayerRenderer } from "@babylonjs/core/Rendering/utilityLayerRenderer";
import { Scene } from "@babylonjs/core/scene";

import { ComponentElemBase } from "../base/elem";
import { sceneCtx } from "../context";

@customElement("my3d-utility-layer")
export class UtilityElem extends ComponentElemBase {
    @provide({ context: sceneCtx })
    _utilScene!: Scene;

    _layer!: UtilityLayerRenderer;

    @property({ type: Boolean })
    events = false;

    override init() {
        this._layer = new UtilityLayerRenderer(this.main.scene, this.events, false);
        this._utilScene = this._layer.utilityLayerScene;
    }

    override dispose() {
        this._layer.dispose();
    }
}
