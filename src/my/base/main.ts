import { provide } from "@lit/context";
import { css, html, ReactiveElement, render, type PropertyValues } from "lit-element";
import { property } from "lit-element/decorators.js";

import type { Engine } from "@babylonjs/core/Engines/engine";
import { Deferred } from "@babylonjs/core/Misc/deferred";
import { Scene } from "@babylonjs/core/scene";
import { assertNonNull } from "@utils/asserts";

import { sceneCtx } from "../context";

/**
 * Base for main scene component.
 *
 * - provides readiness status flag  
 * - creates canvas
 * - expects subclass `_init` to create engine and scene
 * - handles canvas resizing
 * - handles visibility check to suspend/resume rendering
 * - provides scene to all ancestors via context
 *
 * @context babylon.scene
 */
export abstract class MainElemBase extends ReactiveElement {
    /** threshold of canvas visibility to suspend rendering */
    @property({ type: Number })
    visibilityThreshold = 0.25;

    /** the canvas element
     * created ahead of any initialization
     */
    canvas: HTMLCanvasElement;

    /** the engine
     * should be initialized by `_init`
     */
    engine!: Engine;

    /**
     * the scene 
     * should be initialized by `_init`
     * 
     * @context babylon.scene
     */
    @provide({ context: sceneCtx })
    scene!: Scene;

    whenReady = new Deferred<boolean>();
    isReady = false;

    static override styles = [
        css`
            :host {
                display: block;
                position: relative;
            }

            canvas {
                display: block;
                position: absolute;
                width: 100%;
                height: 100%;
                z-index: 0;
            }
        `,
    ];

    /**
     * Called once to render shadow DOM
     * The renering is performed after initialization of engine and scene. 
     */
    protected _renderHTML() {
        return html`${this.canvas}`;
    }

    /**
     * Should init engine, scene, whateve
     */
    abstract _init(): void;

    /**
     * Should dispose engine, scene, whateve
     */
    abstract _dispose(): void;

    /**
     * Called once when scene becomes initially ready
     */
    protected _onready() {
        // TODO: auto activate first camera if none selected during initialization 
        this._startRendering();
        this.whenReady.resolve(true);
        this.isReady = true;
    }

    /**
     * Called to start/resume rendering
     */
    protected _startRendering() {
        if (!this.scene.isReady()) return;
        this.scene.activeCamera?.setEnabled(true);
        this.engine.runRenderLoop(this.#rendering);
    }

    /**
     * Called to stop/suspend rendering
     */
    protected _stopRendering() {
        this.engine.stopRenderLoop(this.#rendering);
        this.scene.activeCamera?.setEnabled(false);
    }

    constructor() {
        super();
        this.canvas = this.ownerDocument.createElement("canvas");
        // some initial non null size
        this.canvas.width = 640;
        this.canvas.height = 480;
    }

    override connectedCallback(): void {
        super.connectedCallback();

        this._init();
        assertNonNull(this.engine);
        assertNonNull(this.scene);

        // rendering shadow after scene initialized
        render(this._renderHTML(), this.renderRoot);

        this.#resizingObs.observe(this);
        this.#visibilityObs.observe(this);

        // FIXME: prevent initial call to update

        // after shadow dom initializes
        queueMicrotask(() => {
            this.scene.executeWhenReady(() => this._onready(), true);
        });
    }

    override disconnectedCallback(): void {
        this.#resizingObs.disconnect();
        this.#visibilityObs.disconnect();
        this._stopRendering();
        this._dispose();

        super.disconnectedCallback();
    }

    // @ts-ignore
    override connectedMoveCallback() {
        // trying to keep context when reconnecting (not widely available)
    }

    override shouldUpdate(_changedProperties: PropertyValues): boolean {
        return this.isReady;    
    }

    #needresize = true;

    #resizingObs = new ResizeObserver(() => {
        this.#needresize = true;
    });

    #visibilityObs = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting) this._startRendering();
            else this._stopRendering();
        },
        { threshold: this.visibilityThreshold }
    );

    #rendering = () => {
        if (this.#needresize) {
            this.engine.resize();
            this.#needresize = false;
        }
        if (this.scene.activeCamera) {
            this.scene.render();
        }
    };
}
