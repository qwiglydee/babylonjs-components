import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import "@babylonjs/core/Layers/effectLayerSceneComponent";
import { HighlightLayer } from "@babylonjs/core/Layers/highlightLayer";
import { Color3 } from "@babylonjs/core/Maths";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Nullable } from "@babylonjs/core/types";
import { debug } from "@utils/debug";

import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { TargetingCtrl } from "./controllers/targetPicking";
import { SceneElement } from "./elements";


/**
 * highlights single mesh
 */
@customElement("my3d-highlighter1")
export class MyHighlighter1Elem extends SceneElement {
    @property({ type: Color3, converter: (hexvalue, _) => hexvalue ? Color3.FromHexString(hexvalue) : Color3.White()})
    color: Color3 = Color3.White();

    @state()
    target: Nullable<AbstractMesh> = null;

    _highlighter!: HighlightLayer;

    #pickCtrl = new TargetingCtrl(this);
    
    override init() {
        debug(this, "initilizing");
        this._highlighter = new HighlightLayer("(highlighter)", this.scene);
    }

    override dispose(): void {
        this._highlighter.dispose();
    }

    override update(changes: PropertyValues): void {
        if (changes.has('target')) {
            debug(this, "highlighting", { target: this.target, color: this.color })
            this.clear();
            if (this.target) this._highlighter.addMesh(this.target as Mesh, this.color)
        }
        super.update(changes);
    }

    clear() {
        this._highlighter.removeAllMeshes();
    }

}
