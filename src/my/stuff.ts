import { consume } from "@lit/context";
import { customElement, property } from "lit/decorators.js";

import { PBRMetallicRoughnessMaterial } from "@babylonjs/core/Materials/PBR/pbrMetallicRoughnessMaterial";
import { Vector3 } from "@babylonjs/core/Maths";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import type { Scene } from "@babylonjs/core/scene";
import { debug } from "@utils/debug";
import { VirtualElement } from "@utils/element";

import { sceneCtx } from "./context";

@customElement("my3d-stuff")
export class MyStuffElem extends VirtualElement {
    @consume({ context: sceneCtx, subscribe: false })
    scene!: Scene;

    @property({ type: Number })
    radius = 10;

    @property({ type: Number })
    size = 1;

    @property({ type: Number })
    count = 3;

    static shapes = ['box', 'ball', 'cone', 'diamond'];

    override connectedCallback(): void {
        super.connectedCallback();
        this.#init();
        this.#create();
    }

    #randomLoc() {
        const rndc = () => (Math.random() * 2 - 1) * this.radius;
        const snap = (coord: number) => this.size * (0.5 + Math.floor(coord / this.size));

        return new Vector3(snap(rndc()), 0.5 * this.size, snap(rndc()));
    }

    _defaultMat!: PBRMetallicRoughnessMaterial;


    _createItem = (shape: string) => {
        debug(this, "creating", { shape });
        const scene = this.scene;

        let mesh: Mesh;
        switch (shape) {
            case 'box':
                mesh = MeshBuilder.CreateBox(shape, { size: this.size }, scene);
                break;
            case 'ball':
                mesh = MeshBuilder.CreateSphere(shape, { diameter: this.size }, scene);
                break;
            case 'cone':
                mesh = MeshBuilder.CreateCylinder(shape, { height: this.size, diameterBottom: this.size, diameterTop: 0 }, scene);
                break;
            case 'diamond':
                mesh = MeshBuilder.CreateIcoSphere(shape, { radius: 0.5 * this.size, subdivisions: 1 }, scene);
                break;
            default:
                throw Error();
        }
        let idx = (1 + (scene.meshes.length ?? 0)).toString().padStart(3, "0");
        mesh.id = `${shape}.${idx}`;
        mesh.position = this.#randomLoc();
        mesh.material = this._defaultMat;
        return mesh;
    };

    async #init() {
        this._defaultMat = new PBRMetallicRoughnessMaterial("default", this.scene);
        this._defaultMat.metallic = 0;
        this._defaultMat.roughness = 0.5;    
    }

    async #create() {
        if (!this.count) return;
        for (let i = 0; i < this.count; i++) this._createItem(MyStuffElem.shapes[i % 4]);
    }

    createItem(shape?: string) {
        if (!shape) shape = MyStuffElem.shapes[Math.floor(Math.random() * MyStuffElem.shapes.length)]
        this._createItem(shape);
    }
}
