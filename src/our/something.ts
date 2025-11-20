import { consume } from "@lit/context";
import { css, html } from "lit";
import { customElement } from "lit/decorators.js";

import { debug } from "@utils/debug";

import { statusCtx } from "./context";
import { LinkedElement } from "./elements";

@customElement("our-something")
export class OurSomethingElem extends LinkedElement {
    @consume({ context: statusCtx, subscribe: true })
    status?: string;

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

    override linkedCallback(): void {
        debug(this, "linked babylon", this.babylon);
    }

    protected override render() {
        // debug(this, "rendering");
        return html`${this.status}, ${this.babylon?.localName}#${this.babylon?.id}!`;
    }
}
