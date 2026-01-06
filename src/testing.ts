import { html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Node as BabylonNode } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { assertNonNull } from "@utils/asserts";

import { CameraElemBase } from "./my/base/camera";
import { ComponentElemBase } from "./my/base/elem";
import { MainElemBase } from "./my/base/main";
import { NodeElemBase } from "./my/base/node";
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


@customElement("test-node")
export class TestNodeElem extends NodeElemBase<TransformNode> {
    @property({ useDefault: true, reflect: false, converter: coordsConverter })
    position: Coords = { x: 0, y: 0, z: 0 };

    override init(): void {
        this._node = new TransformNode("something", this.scene);
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
    /** write-only position */
    @property({ useDefault: true, reflect: false, converter: coordsConverter })
    position: Coords = { x: 0, y: 0, z: 0 };

    override init(): void {
        this._camera = new FreeCamera("camera", coordsConverter.toVector3(this.position), this.scene, false);
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
