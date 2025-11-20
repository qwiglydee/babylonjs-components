import { css, html, PropertyValues, ReactiveElement, render } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

import { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import { Engine } from "@babylonjs/core/Engines/engine";
import type { EngineOptions } from "@babylonjs/core/Engines/thinEngine";
import { ILoadingScreen } from "@babylonjs/core/Loading/loadingScreen";
import { Color4 } from "@babylonjs/core/Maths";
import { Scene } from "@babylonjs/core/scene";
import { Nullable } from "@babylonjs/core/types";
import { provide } from "@lit/context";
import { dbgChanges, debug } from "@utils/debug";
import { queueEvent } from "@utils/events";

import { IBabylonElem, pickCtx, sceneCtx, sizeCtx } from "./context";
import { MoveingCtrl } from "./controllers/appMoving";
import { PickingCtrl } from "./controllers/appPicking";

const ENGOPTIONS: EngineOptions = {
    antialias: true,
    stencil: true,
    doNotHandleContextLost: true,
};

@customElement("my3d-babylon")
export class MyBabylonElem extends ReactiveElement implements IBabylonElem {
    @query("canvas", true)
    canvas!: HTMLCanvasElement;

    @query("my3d-screen", true)
    screen!: HTMLElement & ILoadingScreen;

    engine!: Engine;

    @provide({ context: sceneCtx })
    scene!: Scene; // available to subcomponents immediately

    @provide({ context: sizeCtx })
    @property({ type: Number })
    worldSize = 100;

    @property({ type: Boolean })
    rightHanded = false;

    @property({ type: Number })
    visibilityMin = 0.25;

    @property()
    background = "#33334D"; // babylon brand color to sync all backgrounds

    @provide({ context: pickCtx })
    @state()
    picked: Nullable<PickingInfo> = null;

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

    #needresize = true;
    #resizingObs!: ResizeObserver;
    #visibilityObs!: IntersectionObserver;

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

    _pickCtrl = new PickingCtrl(this);
    _moveCtrl = new MoveingCtrl(this);

    override connectedCallback(): void {
        super.connectedCallback();
        this._init();
        this.#resizingObs.observe(this);
        this.#visibilityObs.observe(this);

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
        debug(this, "initializing", this.canvas);
        this.engine = new Engine(this.canvas, undefined, ENGOPTIONS);
        this.engine.loadingScreen = this.screen;
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
        // debug(this, "ready");
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

    // override update(changes: PropertyValues): void {
    //     debug(this, "updating", dbgChanges(this, changes));
    //     super.update(changes);
    // }

    override updated(changes: PropertyValues): void {
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
}
