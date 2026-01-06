import { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { Nullable } from "@babylonjs/core/types";

import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { GhostBehavior } from "@lib/ghostbhv";

import { SceneNodeElemBase } from "../base/node";
import { TargetingCtrl } from "../controllers/targeting";

@customElement("my3d-ghost")
export class MyGhostElem extends SceneNodeElemBase<Mesh> {
    static override auxiliary = true;

    @property({ type: Boolean })
    autoHide = false;

    @property({ type: Number })
    opacity = 0.5;

    @property({ type: Boolean })
    wireframe = false;

    @state()
    _target: Nullable<Mesh> = null;
    #targeting = new TargetingCtrl(this);

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
        if (this.enabled && changes.has("_target")) {
            this._bhv.targetMesh = this._target;
            this.visible = this._target !== null;
        }
        super.update(changes);
    }
}
