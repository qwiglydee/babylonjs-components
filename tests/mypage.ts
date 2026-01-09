import { ElementHandle, JSHandle, Page } from "@playwright/test";

import type { Scene } from "@babylonjs/core/scene";
import type { MainElem } from "../src/my/main";

import { loadPage } from "./testpage";

export async function loadBabylonHeadful(page: Page, html: string): Promise<{ babylon: ElementHandle<MainElem>; scene: JSHandle<Scene> }> {
    await loadPage(page, `<b3d-main>${html}</b3d-main>`);
    const babylon = (await page.locator("b3d-main").elementHandle()) as ElementHandle<MainElem>;
    await babylon.evaluate((_) => _.whenReady.promise);
    const scene = await babylon.evaluateHandle((_) => _.scene);
    return { babylon, scene };
}