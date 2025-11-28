import { createContext } from "@lit/context";

import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";

export const guiCtx = createContext<AdvancedDynamicTexture>(Symbol('babylon.gui'));

