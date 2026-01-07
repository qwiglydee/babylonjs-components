import { customElement, query } from "lit/decorators.js";

import { assertNonNull } from "@utils/asserts";
import { WrappingElement } from "./base";
import type { IComponentElem } from "./interfaces";

@customElement("our-stuff-add")
export class OurStuffAddElem extends WrappingElement {
    @query("button[name=create]", true)
    addButton!: HTMLButtonElement;

    @query("select[name=shape]", true)
    shapeSelect!: HTMLSelectElement;

    override linkedCallback(): void {
        assertNonNull(this.babylon, "Missing babylon element");
        this.addButton.addEventListener("click", () => this._createStuff());
        this.shapeSelect.disabled = false;
        this.addButton.disabled = false;
    }

    _createStuff() {
        const elem = document.createElement("my3d-stuff");
        elem.setAttribute("shape", this.shapeSelect.value);
        elem.setAttribute('positionRnd', "10");
        elem.setAttribute('texture', "assets/checker.png");
        this.babylon?.appendChild(elem);
    }
}

@customElement("our-stuff-tools")
export class OurStuffToolsElem extends WrappingElement {
    @query("select[name=id]", true)
    itemSelect!: HTMLInputElement;

    @query("button[name=delete]", true)
    deleteButton!: HTMLButtonElement;

    @query("input[name=enabled]", true)
    enableCheck!: HTMLInputElement;

    @query("input[name=visible]", true)
    visibleCheck!: HTMLInputElement;

    selected: IComponentElem | null = null;

    override linkedCallback(): void {
        assertNonNull(this.babylon, "Missing babylon element");
        this.babylon.addEventListener('babylon.pick', (e) => this._selectStuff(e.detail?.id));
        this.babylon.addEventListener('babylon.update', () => this._updateStuff());
        this.itemSelect.addEventListener('change', () => this._selectStuff(this.itemSelect.value));
        this.deleteButton.addEventListener('click', () => this._delStuff());
        this.enableCheck.addEventListener('change', () => this._toggleEnable(this.enableCheck.checked));
        this.visibleCheck.addEventListener('change', () => this._toggleVisible(this.visibleCheck.checked));
        this._updateStuff();
    }

    _updateStuff() {
        const stuff = this.babylon!.getStuff();
        // create options for all found stuff
        this.itemSelect.querySelectorAll('option[value]').forEach(o => o.remove());
        stuff.forEach(item => {
            const option = this.ownerDocument.createElement('option');
            option.textContent = item.name
            option.value = item.id;
            option.selected = this.selected?.id == item.id;
            this.itemSelect.appendChild(option);
        });
    }

    _selectStuff(id: string | null | undefined) {
        this.selected = id ? (document.getElementById(id) as IComponentElem) : null;
        this.itemSelect.value = id ?? "";
        const valid = this.selected !== null;
        this.deleteButton.disabled = !valid;
        this.enableCheck.disabled = !valid;
        this.enableCheck.checked = this.selected?.enabled ?? false;
        this.visibleCheck.disabled = !valid;
        this.visibleCheck.checked = this.selected?.visible ?? false;
    }

    _delStuff() {
        assertNonNull(this.selected);
        this.selected.remove();
        this._selectStuff(null);
    }

    _toggleEnable(enable: boolean) {
        assertNonNull(this.selected);
        this.selected.toggleAttribute('disabled', !enable);
    }

    _toggleVisible(enable: boolean) {
        assertNonNull(this.selected);
        this.selected.toggleAttribute('hidden', !enable);
    }
}
