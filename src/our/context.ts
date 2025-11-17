/** TODO: public interfaces and context **/

import { createContext } from "@lit/context";

export interface IBabylonElem extends HTMLElement {
    
}

export const statusCtx = createContext<string>(Symbol("app.status"));
export const babylonCtx = createContext<IBabylonElem>(Symbol("app.babylon"));