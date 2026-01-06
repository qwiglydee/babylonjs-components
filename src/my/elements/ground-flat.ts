import { consume } from "@lit/context";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures";
import { Color3 } from "@babylonjs/core/Maths";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Nullable } from "@babylonjs/core/types";
import { assertNonNull } from "@utils/asserts";

import { NodeElemBase } from "../base/node";
import { boundsCtx } from "../context";
import type { BoundsInfo } from "../interfaces";

@customElement("my3d-ground-flat")
export class FlatGroundElem extends NodeElemBase<Mesh> {
    static override auxiliary: boolean = true;

    @consume({ context: boundsCtx, subscribe: true })
    @state()
    _bounds: Nullable<BoundsInfo> = null;

    @property()
    src: Nullable<string> = null;

    @property({ type: Number, reflect: false })
    size!: number;

    get autoSize(): boolean {
        // original attribute is preserved because reflect=false
        return this.getAttribute('size') == "auto";
    }

    @property()
    color: string = "#808080";

    @property({ type: Number })
    opacity = 1.0;

    override init() {
        assertNonNull(this.src, `${this.localName}.src is required`)
        const material = new BackgroundMaterial("ground.mat", this.scene);
        material.useRGBColor = false;
        material.backFaceCulling = true;
        material.diffuseTexture = new Texture(this.src, this.scene);
        material.diffuseTexture.hasAlpha = true;
        material.alpha = this.opacity;
        material.primaryColor = Color3.FromHexString(this.color);

        this._node = CreateGround(this.localName, { width: 1.0, height: 1.0, subdivisions: 1 }, this.scene);
        this._node.isPickable = false;
        this._node.material = material;

        this.size ??= this.main.worldSize;
        this.#resize();
        
        super.init();
    }

    #resize() {
        this._node!.scaling.x = this.size;
        this._node!.scaling.z = this.size;
    }

    override update(changes: PropertyValues) {
        if (changes.has("_bounds") && this.autoSize) this.size = 2 * this._bounds!.world.boundingSphere.radiusWorld;
        if (changes.has("size")) this.#resize();
        super.update(changes);
    }
}
