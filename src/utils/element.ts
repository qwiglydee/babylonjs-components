import { ReactiveElement } from "lit";

export class VirtualElement extends ReactiveElement {
    protected override createRenderRoot() {
        return this;
    }
} 