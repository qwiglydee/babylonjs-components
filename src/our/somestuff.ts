import { consume } from "@lit/context";
import { PropertyValues } from "lit";
import { customElement, query } from "lit/decorators.js";

import { assertNonNull } from "@utils/asserts";
import { dbgChanges, debug, debugEvent } from "@utils/debug";
import { statusCtx } from "./context";
import { WrappingElement } from "./elements";

@customElement("our-somestuff")
export class OurSomestuffElem extends WrappingElement {
    @consume({ context: statusCtx, subscribe: true })
    status?: string;

    @query("button[name=hello]")
    button?: HTMLButtonElement;
    
    override linkedCallback(): void {        
        assertNonNull(this.button, "Missing button");
        this.button.addEventListener('click', this.#onclick);
        this.button.disabled = false;
    }

    #onclick = (event: Event) => {
        debugEvent(this, event);
    }
}
