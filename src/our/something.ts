import { consume } from "@lit/context";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { babylonCtx, IBabylonElem, statusCtx } from "./context";
import { debug, dbgChanges } from "@utils/debug";

/**
 * Element linked to neighbour babylon via context.
 * NB: element is not immediately avaiable because of random init/connect order.
 */
@customElement("our-something")
export class OurSomethingElem extends LitElement {
    @consume({ context: statusCtx, subscribe: true })
    status?: string;

    @consume({ context: babylonCtx, subscribe: true })
    babylon: IBabylonElem | null = null;

    @property()
    param: string = "";

    static override styles = css`
        :host {
            display: inline-block;
            background-color: gray;
            color: black;
            border-radius: 8px;
            padding: 4px;
            margin: 4px;
            text-align: center;
        }
    `;

    protected override shouldUpdate(_changedProperties: PropertyValues): boolean {
        return this.babylon != null;
    }

    protected override update(changes: PropertyValues): void {
        if (!this.hasUpdated) this.#init();
        debug(this, "updating", dbgChanges(this, changes));
        super.update(changes);
    }

    protected override render() {
        debug(this, "rendering");
        return html`[${this.param}] ${this.status}, ${this.babylon?.id}!`;
    }

    #init() {
        debug(this, "initializing", this.babylon);
    }
}
