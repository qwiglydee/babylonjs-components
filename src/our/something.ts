import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { babylonCtx, IBabylonElem, statusCtx } from "./context";

@customElement("our-something")
export class OurSomethingElem extends LitElement {
    @consume({ context: statusCtx, subscribe: false })
    status?: string;

    @consume({ context: babylonCtx, subscribe: false })
    babylon?: IBabylonElem;

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
    ` 

    protected override render() {
        return html`${this.status}, ${this.babylon?.id}!`;
    }
}
