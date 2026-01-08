import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { Vector3 } from "@babylonjs/core/Maths/math";
import { CreateIcoSphere } from "@babylonjs/core/Meshes/Builders/icoSphereBuilder";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { querySelectorNodes } from "@lib/queryselecting";
import { dbgChanges, debug } from "@utils/debug";
import { NodeElemBase } from "../base/node";
import { modelCtx } from "../context";
import type { IModelContainer } from "../interfaces";

/**
 * Just a dumb component with multi targeting scene nodes by tags.
 * It relocates its node to barycenter of target nodes.
 *
 * @property disabled: turns off targeting and relocating
 * @property hidden: auto-set when no anchors
 */
@customElement("my3d-something")
export class TestSomethingElem extends NodeElemBase<Mesh> {
    @consume({ context: modelCtx, subscribe: true })
    @state({ hasChanged: () => true }) // do not compare
    model!: IModelContainer;

    @property()
    select: string = "";

    @state()
    __targets: TransformNode[] = [];

    override init() {
        debug(this, "initializing");
        this._node = CreateIcoSphere("barycenter", { radius: 0.125, subdivisions: 1 });
        super.init();
    }

    override update(changes: PropertyValues): void {
        debug(this, "updating", dbgChanges(this, changes));
        if (changes.has("name")) this._node!.name = this.name;
        if (this.__enabled) {
            if (changes.has("model") || changes.has("select") || changes.has("__enabled")) this.#rettach();
            if (changes.has("__targets")) {
                if (this.__targets.length > 1) this.#relocate();
                else this.#reset();
            }
        }
        super.update(changes);
    }

    #rettach() {
        // TODO: in some real component it should better check if the set of targets actually differ 
        if (!this.select) this.__targets = [];
        else this.__targets = querySelectorNodes(this.model, this.select) as TransformNode[]; // FIXME maybe
        debug(this, "selected", { count: this.__targets.length });
    }

    #reset() {
        this.__targets = [];
        this._node!.position = Vector3.ZeroReadOnly;
        this.visible = false;
        debug(this, "reset")
    }

    #relocate() {
        const positions = this.__targets.map((m) => m.getAbsolutePosition());
        const barycenter = positions.reduce((acc, curr) => acc.addInPlace(curr), Vector3.Zero()).scaleInPlace(1 / positions.length);
        this._node!.position = barycenter;
        this.visible = true;
        debug(this, "relocated to", barycenter.toString());
    }
}

