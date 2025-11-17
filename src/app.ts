import { provide } from "@lit/context";
import { ReactiveElement } from "lit";
import { customElement } from "lit/decorators.js";

import { babylonCtx, IBabylonElem, statusCtx } from "./our/context";
import { assertNonNull } from "@utils/asserts";

/**
 * Babylon-unaware web app
 * For orchestration purposes only
 */
@customElement("the-app")
export class TheAppElem extends ReactiveElement {
    protected override createRenderRoot() {
        return this;
    }

    @provide({ context: statusCtx })
    status: string = "...";

    #babylonSel = "my3d-babylon";
    @provide({ context: babylonCtx })
    babylon!: IBabylonElem;

    override connectedCallback(): void {
        super.connectedCallback();
        this.status = "hello";
        const babylon = this.querySelector(this.#babylonSel);
        assertNonNull(babylon, `${this.tagName}: Missing ${this.#babylonSel}`)
        this.babylon = babylon as IBabylonElem;
    }
}