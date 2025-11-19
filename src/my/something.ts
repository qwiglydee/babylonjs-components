import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { Scene } from "@babylonjs/core/scene";
import { dbgChanges, debug } from "@utils/debug";
import { VirtualElement } from "@utils/element";

import { sceneCtx } from "./context";
import { assertNonNull } from "@utils/asserts";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { DirectionalLight } from "@babylonjs/core/Lights";
import { Vector3 } from "@babylonjs/core/Maths";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

@customElement("my3d-something")
export class MySomethingElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    @property()
    texture = "assets/checker.png";

    override connectedCallback(): void {
        super.connectedCallback();
        this.#init();
    }

    #init() {
        assertNonNull(this.scene);
        debug(this, "initilizing");
        new DirectionalLight("test", Vector3.Down(), this.scene);
        let sphere = CreateSphere("test", {}, this.scene);
        sphere.position = Vector3.Forward(this.scene.useRightHandedSystem);
        let mat = new StandardMaterial("test", this.scene);
        mat.diffuseTexture = new Texture(this.texture, this.scene);
        sphere.material = mat; 
    }

    // override update(changes: PropertyValues) {
    //     debug(this, "updating", dbgChanges(this, changes));
    //     super.update(changes);
    // }
}
