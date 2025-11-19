import { consume } from "@lit/context";
import { type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { BackgroundMaterial } from "@babylonjs/core/Materials/Background/backgroundMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3, Vector2 } from "@babylonjs/core/Maths";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import type { Scene } from "@babylonjs/core/scene";
import type { Nullable } from "@babylonjs/core/types";
import { assertNonNull } from "@utils/asserts";

import { VirtualElement } from "@utils/element";
import { sceneCtx, sizeCtx } from "./context";


@customElement("my3d-ground-flat")
export class MyFlatGroundElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    @consume({ context: sizeCtx })
    worldSize = 1;

    @property()
    src: Nullable<string> = null;

    @property({ type: Number })
    size!: number;

    @property({ type: Boolean })
    autoSize = false;

    @property()
    color: string = "#33334D";

    @property({ type: Number })
    opacity = 1.0;

    override connectedCallback(): void {
        assertNonNull(this.src, `${this.tagName}.src is required`)
        super.connectedCallback();
        this.#init();
    }

    _ground!: Mesh;
    _material!: BackgroundMaterial;

    #init() {
        // debug(this, "initilizing");
        this._material = new BackgroundMaterial("(Ground)", this.scene);
        this._material.useRGBColor = false;
        this._material.backFaceCulling = true;
        this._material.diffuseTexture = new Texture(this.src, this.scene);
        this._material.diffuseTexture.hasAlpha = true;

        this._ground = CreateGround("(Ground)", { width: 1.0, height: 1.0, subdivisions: 1 }, this.scene);
        Tags.AddTagsTo(this._ground, "aux");
        this._ground.isPickable = false;
        this._ground.material = this._material;

        this.size ??= 0.5 * this.worldSize;
    }

    // #calcSize() {
    //     return this.model.world ? 2 * (new Vector2(this.model.world.extendSize.x, this.model.world.extendSize.z)).length() : this.defaultSize;
    // }

    #resize() {
        // debug(this, "resizing", { size: this._size });
        this._ground.scaling.x = this.size;
        this._ground.scaling.z = this.size;
    }

    override update(changes: PropertyValues) {
        // if (this.autoSize && (changes.has("model") || changes.has("autoSize"))) this._size = this.#calcSize();
        if (changes.has("size")) this.#resize();
        if (changes.has("opacity")) this._material.alpha = this.opacity;
        if (changes.has("color")) this._material.primaryColor = Color3.FromHexString(this.color);
        super.update(changes);
    }
}
