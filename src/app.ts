import { provide } from "@lit/context";
import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";

import { debug, debugEvent } from "@utils/debug";
import { babylonCtx, BabylonEvent, BabylonPickEvent, BabylonUpdateEvent, IBabylonElem, statusCtx } from "./our/context";

/**
 * Babylon-unaware web app
 * For orchestration purposes only
 * Wraps naked HTML
 */
@customElement("the-app")
export class TheAppElem extends ReactiveElement {
    protected override createRenderRoot() {
        return this;
    }

    @provide({ context: statusCtx })
    status: string = "...";

    @provide({ context: babylonCtx })
    babylon: IBabylonElem | null = null;

    constructor() {
        super();
        this.addEventListener('babylon.init', this.#oninit);
        this.addEventListener('babylon.update', this.#onupdate);
        this.addEventListener('babylon.pick', this.#onpick);
    }

    #oninit = (event: BabylonEvent) => {
        debugEvent(this, event);
        this.babylon = event.target as IBabylonElem;
        this.status = "hello";  
        this.style.visibility="visible";
    }

    #onupdate = (event: BabylonUpdateEvent) => {
        debugEvent(this, event);
    }

    #onpick = (event: BabylonPickEvent) => {
        debugEvent(this, event);
        this.status = event.detail ? `Picked ${event.detail.name} [${event.detail.id}]` : "...";  
    }

    override onclick = (event: Event) => {
        debugEvent(this, event);
        debug(this, "clicked", event.target);
        // @ts-ignore
        if (event.target.name == 'fullscreen') this.toggleFullscreen();
    } 

    toggleFullscreen() {
        this.classList.toggle('fullscreen');
    }
}