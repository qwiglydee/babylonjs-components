import { consume } from "@lit/context";
import { type PropertyValues } from "lit-element";
import { customElement, property, state } from "lit-element/decorators.js";

import { Texture } from "@babylonjs/core/Materials/Textures";
import { Color3 } from "@babylonjs/core/Maths";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { type Mesh } from "@babylonjs/core/Meshes/mesh";
import { type Nullable } from "@babylonjs/core/types";
import { GridMaterial } from "@babylonjs/materials/grid/gridMaterial";
import { assertNonNull } from "@utils/asserts";

import { NodeElemBase } from "../base/node";
import { boundsCtx } from "../context";
import { type BoundsInfo } from "../interfaces";

@customElement("my3d-ground-grid")
export class GridGroundElem extends NodeElemBase<Mesh> {
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

    @property({ type: Number })
    scale = 1;

    @property({ type: Number })
    frequency = 8;

    @property()
    color: string = "#FFFFFF";

    @property({ type: Number })
    opacity = 0.99;

    @property({ type: Number })
    opacity2 = 0.5;

    override init() {
        assertNonNull(this.src, `${this.localName}.src is required`)
        const material = new GridMaterial("ground.grid", this.scene);
        material.majorUnitFrequency = this.frequency;
        material.backFaceCulling = false;
        material.opacityTexture = new Texture(this.src, this.scene);
        material.opacity = this.opacity;
        material.minorUnitVisibility = this.opacity2;
        material.lineColor = Color3.FromHexString(this.color);

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
        (this._node!.material as GridMaterial).gridRatio = this.scale / this.size;
    }

    override update(changes: PropertyValues) {
        if (changes.has("_bounds") && this.autoSize) this.size = 2 * this._bounds!.world.boundingSphere.radiusWorld;
        if (changes.has("size")) this.#resize();
        super.update(changes);
    }
}
