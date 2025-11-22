import { customElement, query, queryAll, state } from "lit/decorators.js";

import { assertNonNull } from "@utils/asserts";
import { PropertyValues } from "lit";
import { WrappingElement } from "./base";
import { BabylonPickEvent } from "./context";
import { debug } from "@utils/debug";

@customElement("our-stuff-add")
export class OurStuffAddElem extends WrappingElement {
    @query("button[name=create]", true)
    button!: HTMLButtonElement;

    @query("select[name=shape]", true)
    select!: HTMLSelectElement;

    @query("input[name=dist]", true)
    inputRnd!: HTMLSelectElement;

    override linkedCallback(): void {
        assertNonNull(this.babylon, "Missing babylon element");
        this.button.addEventListener("click", this.#onclick);
        this.inputRnd.disabled = false;
        this.select.disabled = false;
        this.button.disabled = false;
    }

    #onclick = (_e: Event) => {
        const { value } = this.select;
        if (value) this._addStuff(value);
    };

    // _rndPosition(radius: number) {
    //     const rndc = () => 0.5 + Math.floor((Math.random() * 2 - 1) * radius);
    //     return { x: rndc(), z: rndc()}
    // }

    _addStuff(shape: string) {
        const elem = document.createElement("my3d-stuff");
        elem.setAttribute("shape", shape);
        // @ts-ignore
        // elem.position = this._rndPosition(Number(this.inputRnd.value));
        elem.setAttribute('randomizePos', this.inputRnd.value);
        this.babylon?.appendChild(elem);
    }
}

@customElement("our-stuff-tools")
export class OurStuffToolsElem extends WrappingElement {
    @queryAll("button")
    buttons!: HTMLButtonElement[];

    @queryAll("input")
    inputs!: HTMLInputElement[];

    @query("input[name=enabled]", true)
    inpEnabled!: HTMLInputElement;

    @query("select[name=stuffid]", true)
    selId!: HTMLInputElement;

    @state()
    selected: HTMLElement | null = null;

    override linkedCallback(): void {
        assertNonNull(this.babylon, "Missing babylon element");
        this.babylon.addEventListener('babylon.pick', this.#onpick);
        this.addEventListener("click", this.#onclick);
        this.addEventListener("change", this.#onchange);
    }

    #onclick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.matches("button[name=delete]")) this._delItem();
    }

    #onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target === this.inpEnabled && this.selected) this._tglEnabled(target.checked);
        if (target === this.selId) this._select(target.value);
    }

    #onpick = (event: BabylonPickEvent) => {
        this._select(event.detail?.id ?? null);
    }

    _select(id: string | null) {
        debug(this, "selecting", id);
        this.selected = id ? document.getElementById(id) : null;
    }

    override update(changes: PropertyValues): void {
        if (changes.has('selected')) {
            debug(this, "selected", this.selected);
            this.buttons.forEach(b => b.disabled = this.selected == null);
            this.inputs.forEach(b => b.disabled = this.selected == null);         
            this.selId.value = this.selected ? this.selected.id : "";
            // @ts-ignore
            this.inpEnabled.checked = this.selected ? !this.selected.disabled : false;
        }
        super.update(changes);
    }

    _delItem() {
        assertNonNull(this.selected);
        this.selected.remove();
    }

    _tglEnabled(enable: boolean) {
        assertNonNull(this.selected);
        // @ts-ignore
        this.selected.disabled = !enable;
    }
}
