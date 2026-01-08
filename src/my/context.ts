import { createContext } from "@lit/context";

import type { PickingInfo } from "@babylonjs/core/Collisions/pickingInfo";
import type { Scene } from "@babylonjs/core/scene";
import type { Nullable } from "@babylonjs/core/types";

import type { BoundsInfo, IModelContainer, IMyMain } from "./interfaces";

export const mainCtx = createContext<IMyMain>(Symbol('babylon.main'));
export const sceneCtx = createContext<Scene>(Symbol('babylon.scene'));
export const modelCtx = createContext<IModelContainer>(Symbol('babylon.model'));
export const boundsCtx = createContext<BoundsInfo>(Symbol('babylon.bounds'));
export const pickCtx = createContext<Nullable<PickingInfo>>(Symbol('babylon.pick'));

