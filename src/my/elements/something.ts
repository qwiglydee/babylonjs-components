import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { Vector3 } from "@babylonjs/core/Maths/math";
import { CreateIcoSphere } from "@babylonjs/core/Meshes/Builders/icoSphereBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { dbgChanges, debug } from "@utils/debug";
import { NodeElemBase } from "../base/node";
import { modelCtx } from "../context";
import type { IModelContainer } from "../interfaces";


/**
 * Just a sample component with features
 */
@customElement("my3d-something")
export class TestSomethingElem extends NodeElemBase<Mesh> {
    @consume({ context: modelCtx, subscribe: true })
    @state({ hasChanged: () => true }) // do not compare
    model!: IModelContainer;

    @property({ useDefault: true, reflect: true })
    name: string = "something";

    @property()
    select: string = "";

    override init() {
        debug(this, "initializing");
        this._node = CreateIcoSphere(this.name, { radius: 0.125, subdivisions: 1}); 
        super.init();
    }

    override update(changes: PropertyValues): void {
        debug(this, "updating", dbgChanges(this, changes));
        if (changes.has("name")) this._node!.name = this.name;
        if (changes.has("model")) {
            if (this.model.isEmpty) this.#reset();
            else this.#relocate();
        }
        super.update(changes);
    }

    #reset() {
        this._node!.position = Vector3.Zero(); 
        this.visible = false;
    }

    #relocate() {
        const positions = this.select ? this.model.getMeshesByTags(this.select).map(m => m.getAbsolutePosition()) : [];
        debug(this, "selected positions", { select: this.select, count: positions.length })
        if (positions.length == 0) this.#reset();
        else {
            const barycenter = positions.reduce((acc, curr) => acc.addInPlace(curr), Vector3.Zero()).scaleInPlace(1 / positions.length);
            this._node!.position = barycenter;
            this.visible = true;
            debug(this, "relocated to", barycenter.toString())
        }
    }
}
