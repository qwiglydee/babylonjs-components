import { css, html, PropertyValues, ReactiveElement, render } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import { Engine } from "@babylonjs/core/Engines/engine";
import type { EngineOptions } from "@babylonjs/core/Engines/thinEngine";
import { Scene } from "@babylonjs/core/scene";
import { provide } from "@lit/context";
import { dbgChanges, debug } from "@utils/debug";
import { bubbleEvent } from "@utils/events";
import { IBabylonElem, sceneCtx } from "./context";
import { Color3 } from "@babylonjs/core/Maths";

const ENGOPTIONS: EngineOptions = {
    antialias: true,
    stencil: true,
    doNotHandleContextLost: true,
};

@customElement("my3d-babylon")
export class MyBabylonElem extends ReactiveElement implements IBabylonElem {
    @query("canvas")
    canvas!: HTMLCanvasElement;

    engine!: Engine;

    @provide({ context: sceneCtx })
    scene!: Scene; // available to subcomponents immediately

    @property({ type: Boolean })
    rightHanded = false;

    @property({ type: Number })
    visibilityMin = 0.25;

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
    `;

    render() {
        return html`
            <canvas></canvas>
            <slot name="overlay"></slot>
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

    override connectedCallback(): void {
        super.connectedCallback();
        debug(this, "connected");
        this.#init();
        this.#resizingObs.observe(this);
        this.#visibilityObs.observe(this);
    }

    override disconnectedCallback(): void {
        this.#dispose();
        super.disconnectedCallback();
        debug(this, "disconnected");
    }

    // @ts-ignore
    override connectedMoveCallback() {
        // keep context when reconnecting (not widely available) 
    }

    #init() {
        render(this.render(), this.renderRoot); /** one-shot rendering */
        debug(this, "initializing", this.canvas);
        this.engine = new Engine(this.canvas, undefined, ENGOPTIONS);
        this.scene = new Scene(this.engine);
        this.scene.useRightHandedSystem = this.rightHanded;

        // NB: some sub-components add stuff in the same frame
        this.scene.whenReadyAsync(true).then(this.#onready);
    }

    #dispose() {
        this.scene.dispose();
        this.engine.dispose();
    }

    #onready = () => {
        bubbleEvent(this, "babylon.init");
        this.#startRendering();
    }

    #startRendering() {
        debug(this, "rendering START");
        this.scene.activeCamera?.setEnabled(true);
        this.engine.runRenderLoop(this.#rendering);
    }

    #stopRendering() {
        debug(this, "rendering STOP");
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
        debug(this, "updating", dbgChanges(this, changes));
        
        super.update(changes);
    }
}
