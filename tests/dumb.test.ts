import { ElementHandle, expect, Page, test } from "@playwright/test";

import type { IBabylonElem } from "../src/my/context";
import type { SceneElement } from "../src/my/base";

import { loadPage } from "./testpage";

async function babylonizePage(page: Page, html?: string) {
    await loadPage(page, `<my3d-babylon-headless>${html}</my3d-babylon-headless>`);
    return await page.locator("my3d-babylon-headless").elementHandle() as ElementHandle<IBabylonElem>;
}


test("initializing", async ({ page }) => {
    const babylon = await babylonizePage(page);

    await babylon.evaluate((elem) => elem.whenReady.promise);
    
    const bablready = await babylon.evaluate((elem) => elem.isReady);
    expect(bablready).toBe(true);

    const scene = await babylon.evaluateHandle((elem) => elem.scene);
    expect(scene).toBeDefined();

    const sceneready = await scene.evaluate((scene) => scene.isReady());
    expect(sceneready).toBe(true);

});

test("augmenting", async ({ page }) => {
    const babylon = await babylonizePage(page, "<my3d-something></my3d-something>");
    const component = await babylon.waitForSelector("my3d-something", { state: 'attached' }) as ElementHandle<SceneElement>;
    const scene = await babylon.evaluateHandle((elem) => elem.scene);
    
    await babylon.evaluate((elem) => elem.whenReady.promise);

    const compready = await component.evaluate((elem) => elem.hasInitialized);
    expect(compready).toBe(true);

    const nodes = await page.evaluate(scene => scene.getNodes().map(n => n.name), scene) 
    expect(nodes).toEqual(["something"]);
});
