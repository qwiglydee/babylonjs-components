import { customElement, query, queryAll, state } from "lit/decorators.js";

import { consume } from "@lit/context";
import { assertNonNull } from "@utils/asserts";
import { dbgChanges, debug } from "@utils/debug";
import { css, CSSResultGroup, html, nothing, PropertyValues } from "lit";
import { babylonCtx, BabylonPickEvent, IBabylonElem, PickDetail } from "./context";
import { LinkedElement, WrappingElement } from "./elements";
import { bubbleEvent } from "@utils/events";

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

@customElement("our-stuff-pick")
export class OurStuffPickElem extends LinkedElement {
    override linkedCallback(): void {
        assertNonNull(this.babylon, "Missing babylon element");
        this.babylon.addEventListener('babylon.pick', this.#onpick);
    }

    @state()
    picked?: PickDetail;

    static override styles = css`:host { display: inline; height: 100; }`

    override render() {
        if (!this.picked) return "";
        return html`${this.picked.name} [${this.picked.id}]`
    }

    #onpick = (event: BabylonPickEvent) => {
        this.picked = event.detail;
    }
}

@customElement("our-stuff-tools")
export class OurStuffToolsElem extends WrappingElement {
    @queryAll("button")
    buttons!: HTMLButtonElement[];

    @queryAll("input")
    inputs!: HTMLInputElement[];

    @query("input[name=enabled]")
    inpEnabled!: HTMLInputElement;

    @query("input[name=visible]")
    inpVisible!: HTMLInputElement;

    @state()
    picked: PickDetail | null = null;

    override linkedCallback(): void {
        assertNonNull(this.babylon, "Missing babylon element");
        this.babylon.addEventListener('babylon.pick', this.#onpick);
        this.addEventListener("click", this.#onclick);
        this.addEventListener("change", this.#onchange);
    }


    #onpick = (event: BabylonPickEvent) => {
        this.picked = event.detail;
    }

    #onclick = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.matches("button[name=delete]")) this._delItem();
    }

    #onchange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (target === this.inpEnabled) this._tglEnabled(target.checked);
        if (target === this.inpVisible) this._tglVisible(target.checked);
    }


    override update(changes: PropertyValues): void {
        debug(this, "updating", dbgChanges(this, changes));
        if (changes.has('picked')) {
            debug(this, "picked", this.picked);
            const valid = this.picked !== null;
            this.buttons.forEach(b => b.disabled = !valid); 
            this.inputs.forEach(b => b.disabled = !valid); 
            if (this.picked) {
                this.inpEnabled.checked = this.picked.enabled;
                this.inpVisible.checked = this.picked.visible;
            }
        }
        super.update(changes);
    }

    #getElem() {
        return this.picked ? document.getElementById(this.picked.id) : null;
    }

    _delItem() {
        const elem = this.#getElem();
        if (elem) elem.remove();
    }

    _tglEnabled(enable: boolean) {
        const elem = this.#getElem();
        // @ts-ignore
        if (elem) elem.disabled = !enable;
    }

    _tglVisible(enable: boolean) {
        const elem = this.#getElem();
        // @ts-ignore
        if (elem) elem.hidden = !enable;
    }
}
