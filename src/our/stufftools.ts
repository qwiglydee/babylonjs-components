import { customElement, query } from "lit/decorators.js";

import { consume } from "@lit/context";
import { assertNonNull } from "@utils/asserts";
import { debug } from "@utils/debug";
import { PropertyValues } from "lit";
import { babylonCtx, BabylonPickEvent, IBabylonElem } from "./context";
import { WrappingElement } from "./elements";

@customElement("our-stuff-add")
export class OurStuffAddElem extends WrappingElement {
    @query("button[name=create]")
    button!: HTMLButtonElement;

    @query("select[name=shape]")
    select!: HTMLSelectElement;

    @query("input[name=dist]")
    input!: HTMLSelectElement;

    override linkedCallback(): void {
        assertNonNull(this.babylon, "Missing babylon element");
        this.button.addEventListener("click", this.#onclick);
        this.input.disabled = false;
        this.select.disabled = false;
        this.button.disabled = false;
    }

    #onclick = (_e: Event) => {
        const { value } = this.select;
        if (value) this._addStuff(value);
    };

    _rndPosition(radius: number) {
        const rndc = () => 0.5 + Math.floor((Math.random() * 2 - 1) * radius);
        return { x: rndc(), z: rndc()}
    }

    _addStuff(shape: string) {
        const elem = document.createElement("my3d-stuff");
        elem.setAttribute("shape", shape);
        // @ts-ignore
        elem.setPosition(this._rndPosition(Number(this.input.value)));
        debug(this, "adding", elem);
        this.babylon?.appendChild(elem);
    }
}


@customElement("our-stuff-del")
export class OurStuffDelElem extends WrappingElement {
    @query("button[name=delete]")
    button!: HTMLButtonElement;

    @query("input[name=id]")
    input!: HTMLInputElement;

    override linkedCallback(): void {
        assertNonNull(this.babylon, "Missing babylon element");
        this.babylon.addEventListener('babylon.pick', this.#onpick);
        this.button.addEventListener("click", this.#onclick);
        this.input.disabled = false;
    }

    #onpick = (event: BabylonPickEvent) => {
        if (event.detail) {
            this.input.value = event.detail.id;
            this.button.disabled = false;
        } else {
            this.input.value = "";
            this.button.disabled = true;
        }
    }

    #onclick = (_event: Event) => {
        const { value } = this.input;
        if (value) this._delStuff(value);
    };

    _delStuff(id: string) {
        const elem = document.getElementById(id);
        debug(this, "deleting", elem);
        elem?.remove();
    }
}
