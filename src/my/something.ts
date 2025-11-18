import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";

import type { Scene } from "@babylonjs/core/scene";
import { dbgChanges, debug } from "@utils/debug";
import { VirtualElement } from "@utils/element";

import { sceneCtx } from "./context";
import { assertNonNull } from "@utils/asserts";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { DirectionalLight } from "@babylonjs/core/Lights";
import { Vector3 } from "@babylonjs/core/Maths";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

@customElement("my3d-something")
export class MySomethingElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    override connectedCallback(): void {
        super.connectedCallback();
        this.#init();
    }

    #init() {
        assertNonNull(this.scene);
        debug(this, "initilizing");
        new DirectionalLight("test", Vector3.Down(), this.scene);
        let sphere = CreateSphere("test", {}, this.scene);
        sphere.material = new StandardMaterial("test", this.scene);
        sphere.position.z = 3;
    }

    override update(changes: PropertyValues) {
        debug(this, "updating", dbgChanges(this, changes));
        super.update(changes);
    }
}
