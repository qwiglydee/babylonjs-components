import { consume } from "@lit/context";
import { type PropertyValues } from "lit-element";
import { customElement, property, state } from "lit-element/decorators.js";

import { type PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { type Mesh } from "@babylonjs/core/Meshes/mesh";
import { type Nullable } from "@babylonjs/core/types";
import { GhostBehavior } from "@lib/ghostbhv";

import { NodeElemBase } from "../base/node";
import { pickCtx } from "../context";

@customElement("my3d-ghost")
export class GhostElem extends NodeElemBase<Mesh> {
    static override auxiliary = true;

    @consume({ context: pickCtx, subscribe: true })
    @state()
    _picked: Nullable<PickingInfo> = null;

    @property({ type: Boolean })
    autoHide = false;

    @property({ type: Number })
    opacity = 0.5;

    @property({ type: Boolean })
    wireframe = false;

    _bhv!: GhostBehavior;

    override init(): void {
        this._node = CreateBox("ghost", {}, this.scene);
        this._node.isPickable = false;

        const mat = new BackgroundMaterial("ghost.mat", this.scene);
        mat.alpha = this.opacity;
        mat.wireframe = this.wireframe;
        this._node.material = mat;

        this._bhv = new GhostBehavior();
        this._bhv.autoHide = this.autoHide;
        this._bhv.attach(this._node);

        this.visible = false;

        super.init();
    }

    override update(changes: PropertyValues) {
        if (this.enabled && changes.has("_picked")) {
            let mesh = this._picked?.pickedMesh ?? null;
            this._bhv.targetMesh = mesh;
            this.visible = mesh !== null;
        }
        super.update(changes);
    }
}
