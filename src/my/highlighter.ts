import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@babylonjs/core/Layers/effectLayerSceneComponent";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { Color3 } from "@babylonjs/core/Maths";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Nullable } from "@babylonjs/core/types";

import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { SceneElement } from "./base";
import { TargetingCtrl } from "./controllers/targetPicking";


/**
 * highlights single mesh
 */
@customElement("my3d-highlighter")
export class MyHighlighter1Elem extends SceneElement {
    @property({ type: Color3, converter: (hexvalue, _) => hexvalue ? Color3.FromHexString(hexvalue) : Color3.White()})
    color: Color3 = Color3.White();

    @state()
    target: Nullable<AbstractMesh> = null;

    _highlighter!: HighlightLayer;

    _pickCtrl = new TargetingCtrl(this);
    
    override init() {
        this._highlighter = new HighlightLayer("(highlighter)", this.scene);
    }

    override dispose(): void {
        this._highlighter.dispose();
    }

    override update(changes: PropertyValues): void {
        if (changes.has('target')) {
            // debug(this, "highlighting", { target: this.target, color: this.color.toString() })
            this.clear();
            if (this.target) this._highlighter.addMesh(this.target as Mesh, this.color)
        }
        super.update(changes);
    }

    override toggle(enabled: boolean): void {
        this._syncEnabled(this._highlighter, enabled);
    }

    clear() {
        this._highlighter.removeAllMeshes();
    }

}
