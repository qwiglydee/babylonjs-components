import { consume } from "@lit/context";
import { customElement, property, state } from "lit/decorators.js";

import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import { Vector3 } from "@babylonjs/core/Maths";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { debug } from "@utils/debug";
import { VirtualElement } from "@utils/element";

import { sceneCtx } from "./context";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { assert, assertNonNull } from "@utils/asserts";
import { PropertyValues } from "lit";

@customElement("my3d-stuff")
export class MyStuffElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    @property()
    shape?: string;

    @property({ type: Number })
    size = 1;

    @property()
    texture = "assets/checker.png";

    @property({ type: Number })
    rndRadius = 1;

    @state()
    _position = Vector3.Zero();

    setPosition(coords: {x?: number, y?: number, z?: number}) {
        // NB: invoked before mesh created
        this._position = new Vector3(
            coords.x ?? this._position.x,
            coords.y ?? this._position.y,
            coords.z ?? this._position.z
        );
    }

    override disconnectedCallback(): void {
        this.#dispose();
        super.disconnectedCallback();
    }

    override update(changes: PropertyValues): void {
        if (!this.hasUpdated) this.#init();
        if (changes.has('_position')) this._mesh.position = this._position;
        super.update(changes);
    }

    _mesh!: Mesh;

    _getMatrial() {
        let mat = this.scene.getMaterialByName("test") as PBRMaterial;
        if (!mat) {
            mat = new PBRMaterial("test", this.scene);
            mat.albedoTexture = new Texture(this.texture, this.scene, { invertY: false });
            mat.roughness = 0.5;
        }
        return mat;
    }

    #init() {
        assertNonNull(this.shape, `Missing ${this.tagName}.shape`);

        let id = this.id;
        if (!id) {
            let idx = (1 + (this.scene.meshes.length ?? 0)).toString().padStart(3, "0");
            id = `${this.shape}.${idx}`;
            this.id = id;
        }
        debug(this, "creating", {shape: this.shape, id });

        switch (this.shape) {
            case 'cube':
                this._mesh = MeshBuilder.CreateBox(this.shape, { size: this.size }, this.scene);
                break;
            case 'sphere':
                this._mesh = MeshBuilder.CreateSphere(this.shape, { diameter: this.size }, this.scene);
                break;
            case 'cone':
                this._mesh = MeshBuilder.CreateCylinder(this.shape, { height: this.size, diameterBottom: this.size, diameterTop: 0 }, this.scene);
                break;
            case 'icosphere':
                this._mesh = MeshBuilder.CreateIcoSphere(this.shape, { radius: 0.5 * this.size, subdivisions: 1 }, this.scene);
                break;
            default:
                throw Error(`Invalid shape: ${this.shape}`);
        }
        this._mesh.id = id;
        this._mesh.position.y = 0.5 * this.size;
        this._mesh.bakeCurrentTransformIntoVertices();
        this._mesh.material = this._getMatrial();
    };

    #dispose() {
        this._mesh.dispose(true, false);
    }

}
