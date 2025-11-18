import { provide } from "@lit/context";
import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";

import { babylonCtx, BabylonInitEvent, IBabylonElem, statusCtx } from "./our/context";
import { assertNonNull } from "@utils/asserts";
import { debug, debugEvent } from "@utils/debug";

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
    }

    #oninit = (event: BabylonInitEvent) => {
        debugEvent(this, event);
        this.status = "hello";  
        this.babylon = event.target as IBabylonElem;
    }
}