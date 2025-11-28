import { provide } from "@lit/context";
import { customElement, property } from "lit/decorators.js";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";

import { SceneElement } from "../base";
import { guiCtx } from "./context";

@customElement("my2g-gui")
export class MyGUIElem extends SceneElement {
    @provide({ context: guiCtx })
    gui!: AdvancedDynamicTexture;

    @property()
    name: string = "GUI";

    @property({ type: Boolean })
    foreground = false;

    override init(): void {
        this.gui = AdvancedDynamicTexture.CreateFullscreenUI(this.name, this.foreground, this.scene);        
    }

    override dispose(): void {
        this.gui.dispose();        
    }

    override toggle(enabled: boolean): void {
        if (!enabled) throw Error("disabling not supported");
    }
}
