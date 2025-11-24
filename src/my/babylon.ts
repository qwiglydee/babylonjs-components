import { ContextProvider, provide } from "@lit/context";
import { css, html, PropertyValues, ReactiveElement, render } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { BoundingInfo } from "@babylonjs/core/Culling/boundingInfo";
import { Engine } from "@babylonjs/core/Engines/engine";
import type { EngineOptions } from "@babylonjs/core/Engines/thinEngine";
import { ILoadingScreen } from "@babylonjs/core/Loading/loadingScreen";
import { Color4, Vector3 } from "@babylonjs/core/Maths";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Tags } from "@babylonjs/core/Misc/tags";
import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { debug } from "@utils/debug";
import { queueEvent } from "@utils/events";

import { querySelectorNode, querySelectorNodes } from "../lib/queryselecting";
import { babylonCtx, boundsCtx, BoundsInfo, IBabylonElem, pickCtx, sceneCtx } from "./context";
import { MoveingCtrl } from "./controllers/appMoving";
import { PickingCtrl } from "./controllers/appPicking";

const ENGOPTIONS: EngineOptions = {
    antialias: true,
    stencil: true,
    doNotHandleContextLost: true,
};

@customElement("my3d-babylon")
export class MyBabylonElem extends ReactiveElement implements IBabylonElem {
    selfCtx = new ContextProvider(this, { context: babylonCtx, initialValue: this }); // provide the IBabylonElem api

    @property({ type: Number })
    worldSize = 100;

    @property({ type: Boolean })
    rightHanded = false;

    engine!: Engine;

    @provide({ context: sceneCtx })
    scene!: Scene; // available to subcomponents immediately

    static dumbounds = new BoundingInfo(new Vector3(-1, -1, -1), new Vector3(+1, +1, +1));

    @provide({ context: boundsCtx })
    bounds: BoundsInfo = { model: MyBabylonElem.dumbounds, world: MyBabylonElem.dumbounds };

    @provide({ context: pickCtx })
    @state()
    picked: Nullable<PickingInfo> = null;

    @property({ type: Number })
    visibilityMin = 0.25;

    @property()
    background = "#33334D"; // just to sync all backgrounds

    static override styles = css`
        :host {
            display: block;
            position: relative;
        }

        canvas {
            position: absolute;
            display: block;
            width: 100%;
            height: 100%;
            z-index: 0;
        }

        slot[name="overlay"] {
            position: absolute;
            display: block;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }

        my3d-screen {
            z-index: 2;
        }
    `;

    render() {
        return html`
            <canvas></canvas>
            <slot name="overlay"></slot>
            <my3d-screen></my3d-screen>
        `;
    }

    @query("canvas", true)
    _canvas!: HTMLCanvasElement;

    @query("my3d-screen", true)
    _screen!: HTMLElement & ILoadingScreen;

    #needresize = true;
    #resizingObs!: ResizeObserver;
    #visibilityObs!: IntersectionObserver;

    _pickCtrl = new PickingCtrl(this);
    _moveCtrl = new MoveingCtrl(this);

    constructor() {
        super();
        this.#resizingObs = new ResizeObserver(() => {
            this.#needresize = true;
        });
        this.#visibilityObs = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) this.#startRendering();
                else this.#stopRendering();
            },
            { threshold: this.visibilityMin }
        );
    }

    static _importantMesh(mesh: AbstractMesh) {
        return Tags.MatchesQuery(mesh, "!aux");
    }

    override connectedCallback(): void {
        super.connectedCallback();
        this._init();
        this.#resizingObs.observe(this);
        this.#visibilityObs.observe(this);

        const affect = (mesh: AbstractMesh) => {
            if (MyBabylonElem._importantMesh(mesh)) this.requestUpdate("scene");
        };

        this.scene.onNewMeshAddedObservable.add(affect);
        this.scene.onMeshRemovedObservable.add(affect);

        // let sub-components init their stuff
        queueMicrotask(() => {
            this.scene.executeWhenReady(this.#onready, true);
        });
    }

    override disconnectedCallback(): void {
        this.#resizingObs.disconnect();
        this.#visibilityObs.disconnect();
        this.#stopRendering();
        this._dispose();
        super.disconnectedCallback();
    }

    // @ts-ignore
    override connectedMoveCallback() {
        // keep context when reconnecting (not widely available)
    }

    _init() {
        render(this.render(), this.renderRoot); /** one-shot rendering */
        debug(this, "initializing", this._canvas);
        this.engine = new Engine(this._canvas, undefined, ENGOPTIONS);
        this.engine.loadingScreen = this._screen;
        this.engine.loadingScreen.loadingUIBackgroundColor = this.background;
        this.scene = new Scene(this.engine);
        this.scene.useRightHandedSystem = this.rightHanded;
        this.scene.clearColor = Color4.FromHexString(this.background);
    }

    _dispose() {
        this.scene.dispose();
        this.engine.dispose();
    }

    #onready = () => {
        debug(this, "ready");
        this.#startRendering();
        this.engine.hideLoadingUI();
        queueEvent(this, "babylon.init");
    };

    #startRendering() {
        if (!this.scene.isReady()) return;
        this.scene.activeCamera?.setEnabled(true);
        this.engine.runRenderLoop(this.#rendering);
    }

    #stopRendering() {
        this.engine.stopRenderLoop(this.#rendering);
        this.scene.activeCamera?.setEnabled(false);
    }

    #rendering = () => {
        if (this.#needresize) {
            this.engine.resize();
            this.#needresize = false;
        }
        if (this.scene.activeCamera) {
            this.scene.render();
        }
    };

    override update(changes: PropertyValues): void {
        // comes from requestUpdate('scene')
        if (changes.has("scene")) {
            debug(this, "scene updated");
            this.bounds = this.getBounds();
        }
        super.update(changes);
    }

    override updated(changes: PropertyValues): void {
        // TODO: ibservables
        if (changes.has("scene")) {
            queueEvent(this, "babylon.update", null);
        }

        if (changes.has("picked")) {
            const mesh = this.picked?.pickedMesh;
            if (mesh) {
                queueEvent(this, "babylon.pick", {
                    name: mesh.name,
                    id: mesh.id,
                    enabled: mesh.isEnabled(),
                    visible: mesh.isVisible,
                });
            } else {
                queueEvent(this, "babylon.pick", null);
            }
        }
    }

    getBounds(): BoundsInfo {
        const ext = this.scene.getWorldExtends(MyBabylonElem._importantMesh);
        if (ext.min.y === Number.MAX_VALUE)
            return {
                model: MyBabylonElem.dumbounds,
                world: MyBabylonElem.dumbounds,
            };

        // mirrored bbox
        const flp = { min: ext.min.scale(-1), max: ext.max.scale(-1) };

        return {
            model: new BoundingInfo(ext.min, ext.max),
            world: new BoundingInfo(
                new Vector3(
                    Math.min(ext.min.x, flp.min.x, ext.max.x, flp.max.x),
                    Math.min(ext.min.y, flp.min.y, ext.max.y, flp.max.y),
                    Math.min(ext.min.z, flp.min.z, ext.max.z, flp.max.z)
                ),
                new Vector3(
                    Math.max(ext.min.x, flp.min.x, ext.max.x, flp.max.x),
                    Math.max(ext.min.y, flp.min.y, ext.max.y, flp.max.y),
                    Math.max(ext.min.z, flp.min.z, ext.max.z, flp.max.z)
                )
            ),
        };
    }

    querySelectorNodes(query: string): Node[] {
        return querySelectorNodes(this.scene, query);
    }

    querySelectorNode(query: string): Nullable<Node> {
        return querySelectorNode(this.scene, query);
    }
}
