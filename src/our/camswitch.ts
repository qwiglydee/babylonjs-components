import { customElement, query } from "lit/decorators.js";

import { assertNonNull } from "@utils/asserts";
import { WrappingElement } from "./base";

@customElement("our-camera-switch")
export class OurCamswitchElem extends WrappingElement {
    @query("select[name=camera]", true)
    select?: HTMLSelectElement;
    
    get cameras() { 
        return this.babylon?.querySelectorAll("my3d-camera-basic");
    }

    override linkedCallback(): void {        
        assertNonNull(this.select, "Missing button");
        this.select.addEventListener('change', this.#onchange);
        this.select.disabled = false;
    }

    #onchange = () => {
        const selected = this.select!.value;
        // @ts-ignore
        this.cameras.forEach(c => c.selected = c.id == selected)
    }
}
