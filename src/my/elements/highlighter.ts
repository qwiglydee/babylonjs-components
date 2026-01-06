import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@babylonjs/core/Layers/effectLayerSceneComponent";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { Color3 } from "@babylonjs/core/Maths";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Nullable } from "@babylonjs/core/types";

import { BabylonComponentBase } from "../base/elem";
import { TargetingCtrl } from "../controllers/targeting";

@customElement("my3d-highlighter")
export class MyHighlighterElem extends BabylonComponentBase {
    @property()
    color = "#FFFFFF";

    _color!: Color3;

    @state()
    _target: Nullable<Mesh> = null;
    #targetingCtrl = new TargetingCtrl(this);

    _highlighter!: HighlightLayer;

    override init() {
        this._color = Color3.FromHexString(this.color);
        this._highlighter = new HighlightLayer("highlighter", this.scene);
    }

    override update(changes: PropertyValues): void {
        if (changes.has('_target')) {
            this.#clear();
            if (this._target) this.#highlight();
        }
        super.update(changes);
    }

    #clear() {
        this._highlighter.removeAllMeshes();
    }

    #highlight() {
        this._highlighter.addMesh(this._target!, this._color)
    }

    override dispose(): void {
        this._highlighter.dispose();
    }
}
