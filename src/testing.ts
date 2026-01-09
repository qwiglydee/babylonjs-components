import { consume } from "@lit/context";
import { html, type PropertyValues } from "lit-element";
import { customElement, property, state } from "lit-element/decorators.js";

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Node as BabylonNode } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { assertNonNull } from "@utils/asserts";

import { CameraElemBase } from "./my/base/camera";
import { ComponentElemBase } from "./my/base/component";
import { MainElemBase } from "./my/base/main";
import { NodeElemBase } from "./my/base/node";
import { modelCtx } from "./my/context";
import type { IModelContainer } from "./my/interfaces";
import { coordsConverter, type Coords } from "./my/properties/coords";


@customElement("test-babylon")
export class TestBabylonElem extends MainElemBase {
    override _init() {
        this.engine = new Engine(this.canvas);
        this.scene = new Scene(this.engine);
    }

    override _dispose(): void {
        this.scene.dispose();
        this.engine.dispose();
    }
}


@customElement("test-babylon-headless")
export class TestHeadlessElem extends MainElemBase {
    override _init() {
        this.engine = new NullEngine();
        this.scene = new Scene(this.engine);
    }

    override _dispose(): void {
        this.scene.dispose();
        this.engine.dispose();
    }
}

@customElement("test-babylon-shadowed")
export class TestBabylonShadowedElem extends TestHeadlessElem {
    override _renderHTML() {
        return html`
            ${this.canvas}
            <test-something></test-something>
        `;
    }
}

@customElement("test-something")
export class TestSomethingElem extends ComponentElemBase {
    @property({ useDefault: true, reflect: true })
    name: string = "something";

    _node!: BabylonNode;

    override init() {
        this._node = new BabylonNode(this.name, this.scene);
    }

    override update(changes: PropertyValues): void {
        if (changes.has("name")) this._node.name = this.name;
        super.update(changes);
    }

    override dispose() {
        this._node.dispose();
    }
}

@customElement("test-somesync")
export class TestSomesyncElem extends ComponentElemBase {
    @state()
    __name: string = "something";

    @property({ useDefault: true })
    set name(value: string) {
        this.__name = value;
    }
    get name(): string {
        return this._node ? this._node.name : this.__name;
    }

    _node!: BabylonNode;

    override init() {
        this._node = new BabylonNode(this.name, this.scene);
    }

    override update(changes: PropertyValues): void {
        if (changes.has("__name")) this._syncName(this.__name);
        super.update(changes);
    }

    /** synchronizing attribute and babylon property */
    _syncName(value: string) {
        assertNonNull(this._node);
        assertNonNull(value);
        this._node.name = value;
        this.setAttribute('name', value);
    }

    override dispose() {
        this._node.dispose();
    }
}


@customElement("test-mesh")
export class TestMeshElem extends NodeElemBase<Mesh> {
    @property()
    override name: string = "something";

    @property({ useDefault: true, reflect: false, converter: coordsConverter })
    position: Coords = { x: 0, y: 0, z: 0 };

    override init(): void {
        this._node = new Mesh(this.name, this.scene);
        this._syncPosition(this.position);
        super.init();
    }

    override update(changes: PropertyValues): void {
        if (changes.has("position")) this._syncPosition(this.position);
        super.update(changes);
    }

    _syncPosition(position: Coords) {
        assertNonNull(this._node);
        assertNonNull(position);
        this._node.position = coordsConverter.toVector3(position)!;
    }
}

@customElement("test-camera")
export class TestCameraElem extends CameraElemBase<FreeCamera> {
    @property()
    override name: string = "somecam";

    /** write-only position */
    @property({ useDefault: true, reflect: false, converter: coordsConverter })
    position: Coords = { x: 0, y: 0, z: 0 };

    override init(): void {
        this._camera = new FreeCamera(this.name, coordsConverter.toVector3(this.position), this.scene, false);
        super.init();
    }

    override update(changes: PropertyValues): void {
        if (changes.has("__position")) this._syncPosition(this.position)!;
        super.update(changes);
    }

    _syncPosition(position: Coords) {
        assertNonNull(this._camera);
        assertNonNull(position);
        this._camera.position = coordsConverter.toVector3(position);
    }
}


@customElement("test-watch")
export class TestWatchElem extends ComponentElemBase {
    @consume({ context: modelCtx, subscribe: true })
    @state({ hasChanged: () => true }) // do not compare
    model!: IModelContainer;

    override init(): boolean | void {
        this.#render();
    }

    override dispose(): void {
        //
    }

    override update(changes: PropertyValues): void {
        if (changes.has('model')) this.#render();
        super.update(changes);
    }

    #render() {
        this.innerText = `${this.model.getNodes().length}`
    }
};