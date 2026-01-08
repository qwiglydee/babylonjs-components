import { provide } from "@lit/context";
import { customElement, property } from "lit/decorators.js";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";

import { guiCtx } from "../../context";
import { ComponentElemBase } from "../../base/elem";

@customElement("my2g-gui-layer")
export class GUI2Layer extends ComponentElemBase {
    @provide({ context: guiCtx })
    _texture!: AdvancedDynamicTexture;

    @property()
    name: string = "GUI";

    @property({ type: Boolean })
    foreground = false;

    override init(): void {
        this._texture = AdvancedDynamicTexture.CreateFullscreenUI(this.name, this.foreground, this.scene);        
    }

    override dispose(): void {
        this._texture.dispose();        
    }
}
