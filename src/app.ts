import { consume, provide } from "@lit/context";
import { PropertyValues, ReactiveElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import { babylonCtx, BabylonInitEvent, BabylonPickEvent, IBabylonElem, statusCtx } from "./our/context";
import { assertNonNull } from "@utils/asserts";
import { dbgChanges, debug, debugEvent } from "@utils/debug";

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
        this.addEventListener('babylon.pick', this.#onpick)
    }

    #oninit = (event: BabylonInitEvent) => {
        debugEvent(this, event);
        this.status = "hello";  
        this.babylon = event.target as IBabylonElem;
    }

    #onpick = (event: BabylonPickEvent) => {
        debugEvent(this, event);
        this.status = event.detail ? `Picked ${event.detail.name} [${event.detail.id}]` : "...";  
    }
}