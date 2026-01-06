/**
 * Babylon-unassociated stuff for integration
 */

import { createContext } from "@lit/context";
import type { IBabylonElem } from "./interfaces";

export const statusCtx = createContext<string>(Symbol("app.status"));
export const babylonCtx = createContext<IBabylonElem | null>(Symbol("app.babylon"));

