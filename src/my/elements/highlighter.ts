import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { type PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import "@babylonjs/core/Layers/effectLayerSceneComponent";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { Color3 } from "@babylonjs/core/Maths";
import { type AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { type Mesh } from "@babylonjs/core/Meshes/mesh";
import { type Nullable } from "@babylonjs/core/types";

import { ComponentElemBase } from "../base/elem";
import { pickCtx } from "../context";

@customElement("my3d-highlighter")
export class HighlighterElem extends ComponentElemBase {
    @consume({ context: pickCtx, subscribe: true})
    @state()
    _picked: Nullable<PickingInfo> = null;

    @property()
    color = "#FFFFFF";

    _color!: Color3;

    _highlighter!: HighlightLayer;

    override init() {
        this._color = Color3.FromHexString(this.color);
        this._highlighter = new HighlightLayer("highlighter", this.scene);
    }

    override update(changes: PropertyValues): void {
        if (changes.has('_picked')) {
            this.#clear();
            if (this._picked?.pickedMesh) this.#highlight(this._picked?.pickedMesh);
        }
        super.update(changes);
    }

    #clear() {
        this._highlighter.removeAllMeshes();
    }

    #highlight(mesh: AbstractMesh) {
        this._highlighter.addMesh(mesh as Mesh, this._color)
    }

    override dispose(): void {
        this._highlighter.dispose();
    }
}
