import { ElementHandle, JSHandle, Page } from "@playwright/test";

import type { Scene } from "@babylonjs/core/scene";
import type { MainElem } from "../src/my/elements/main";

import { loadPage } from "./testpage";

export async function loadBabylonHeadful(page: Page, html: string): Promise<{ babylon: ElementHandle<MainElem>; scene: JSHandle<Scene> }> {
    await loadPage(page, `<my3d-main>${html}</my3d-main>`);
    const babylon = (await page.locator("my3d-main").elementHandle()) as ElementHandle<MainElem>;
    await babylon.evaluate((_) => _.whenReady.promise);
    const scene = await babylon.evaluateHandle((_) => _.scene);
    return { babylon, scene };
}