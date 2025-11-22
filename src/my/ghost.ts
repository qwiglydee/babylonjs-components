import { type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";

import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Nullable } from "@babylonjs/core/types";

import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import { GhostBehavior } from "../lib/ghostbhv";
import { TargetingCtrl } from "./controllers/targetPicking";
import { SceneElement } from "./elements";

@customElement("my3d-ghost")
export class MyGhostElem extends SceneElement {
    @state()
    target: Nullable<AbstractMesh> = null;

    #pickCtrl = new TargetingCtrl(this);

    _mesh!: Mesh;
    _bhv!: GhostBehavior;
    
    override init() {
        this._mesh = CreateBox("(ghost)", {}, this.scene);
        Tags.AddTagsTo(this._mesh, "aux");
        this._mesh.isPickable = false;
        this._mesh.material = new BackgroundMaterial("(ghost)", this.scene);
        this._mesh.material.alpha = 0.25;
        this._mesh.material.wireframe = true;
        
        this._bhv = new GhostBehavior();
        this._bhv.attach(this._mesh);
    }

    override dispose(): void {
        this._mesh.dispose(true, true);
    }

    override update(changes: PropertyValues) {
        if (changes.has('target')) this._bhv.targetMesh = this.target;
        super.update(changes);
    }
}
