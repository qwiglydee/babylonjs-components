import { css, html, PropertyValues, ReactiveElement, render } from "lit";
import { customElement } from "lit/decorators.js";

import { debug } from "@utils/debug";
import { IBabylonElem } from "./context";
import { Deferred } from "@utils/deferred";
import { scheduleEvent } from "@utils/events";

@customElement("my3d-babylon")
export class MyBabylonElem extends ReactiveElement implements IBabylonElem {
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

    constructor() {
        super();
        debug(this, "constructed");
    }

    override connectedCallback(): void {
        super.connectedCallback();
        debug(this, "connected");
        this.#init();
    }

    override disconnectedCallback(): void {
        this.#dispose();
        super.disconnectedCallback();
        debug(this, "disconnected");
    }

    #init() {
        /// TODO
        scheduleEvent(null, 3000, this, "babylon.init");
    }

    #dispose() {
        /// TODO
    }

    protected override update(changes: PropertyValues): void {
        if (!this.hasUpdated) render(this.render(), this.renderRoot); /** one-shot rendering */
        super.update(changes);
    }
}
