import { consume } from "@lit/context";
import { customElement, property } from "lit/decorators.js";

import type { Scene } from "@babylonjs/core/scene";
import { debug } from "@utils/debug";
import { VirtualElement } from "@utils/element";

import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { assertNonNull } from "@utils/asserts";
import { sceneCtx } from "./context";

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
        let sphere = CreateSphere("test", {}, this.scene);
        sphere.position = Vector3.Forward(this.scene.useRightHandedSystem);
        sphere.position.y = 0.5;
        let mat = new PBRMaterial("test", this.scene);
        mat.albedoTexture = new Texture(this.texture, this.scene, { invertY: false });
        mat.roughness = 0.5;
        sphere.material = mat; 
    }

    // override update(changes: PropertyValues) {
    //     debug(this, "updating", dbgChanges(this, changes));
    //     super.update(changes);
    // }
}
