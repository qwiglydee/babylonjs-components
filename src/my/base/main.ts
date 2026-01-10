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
 * - provides readyness async status flag  
 * - creates canvas (unattached)
 * - handles canvas resizing
 * - handles visibility check to suspend/resume rendering
 *
 * Derived concrete class:
 * - should `_init` and `_dispose` engine and scene
 * - should probably override `_renderHTML`
 */
export abstract class MainElemBase extends ReactiveElement {
    /** precentage of canvas visibility to suspend rendering */
    @property({ type: Number })
    visibilityThreshold = 0.25;

    canvas: HTMLCanvasElement;

    /** should be initialized in specific class */
    engine!: Engine;

    /** should be initialized in specific class */
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
     * Called once to initialize shadow DOM
     */
    protected _renderHTML() {
        return html`${this.canvas}`;
    }

    /**
     * Should init engine and scene.
     */
    abstract _init(): void;

    /**
     * Should dispose engine and scene
     */
    abstract _dispose(): void;

    /**
     * Called when scene becomes initially ready
     */
    protected _onready() {
        this._startRendering();
        this.whenReady.resolve(true);
        this.isReady = true;
    }

    /**
     * Called to stop rendering initially or after suspension
     */
    protected _startRendering() {
        if (!this.scene.isReady()) return;
        this.scene.activeCamera?.setEnabled(true);
        this.engine.runRenderLoop(this.#rendering);
    }

    /**
     * Called to stop rendering for suspension
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
        // keep context when reconnecting (not widely available)
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
