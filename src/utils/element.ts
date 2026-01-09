import { ReactiveElement } from "lit-element";

export class VirtualElement extends ReactiveElement {
    protected override createRenderRoot() {
        return this;
    }  
}
