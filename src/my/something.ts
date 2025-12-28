import { customElement } from "lit/decorators.js";
import { SceneElement } from "./base";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";

@customElement("my3d-something")
export class MySomethingElem extends SceneElement {
    _node!: TransformNode;

    override init() {
        this._node = new TransformNode("something", this.scene); 
    }

    override dispose() {
        this._node.dispose();
    }

    override toggle(_: boolean): void {        
    }
}