import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { statusCtx } from "./context";

/**
 * Element linked to neighbour babylon via context.
 * NB: element is not immediately avaiable because of random init/connect order.
 */
@customElement("our-status")
export class OurStatusElem extends LitElement {
    @consume({ context: statusCtx, subscribe: true })
    status?: string;

    static override styles = css`
        :host {
            display: block;
            background-color: lightgray;
            color: black;
            text-align: center;
        }
    `;

    override render() {
        return html`${this.status}`;
    }
}
