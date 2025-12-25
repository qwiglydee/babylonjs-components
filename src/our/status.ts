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
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.5);
        }
    `;

    override render() {
        return html`${this.status}`;
    }
}
