import { ElementHandle, expect, JSHandle, Locator, Page } from "@playwright/test";

import { Scene } from "@babylonjs/core/scene";
import type { BabylonMainBase } from "../src/my/base/main";

export async function loadPage(page: Page, html: string) {
    await page.goto("testpage.html", { waitUntil: "domcontentloaded" });
    const elem = await page.locator("main").elementHandle();
    await elem!.evaluate((elem, html) => (elem!.innerHTML = html), html);
    await page.waitForLoadState("load");
    expect(await page.pageErrors()).toHaveLength(0);
}

export async function loadBabylonHeadless(page: Page, html: string): Promise<{ babylon: ElementHandle<BabylonMainBase>; scene: JSHandle<Scene> }> {
    await loadPage(page, `<test-babylon-headless>${html}</test-babylon-headless>`);
    const babylon = (await page.locator("test-babylon-headless").elementHandle()) as ElementHandle<BabylonMainBase>;
    await babylon.evaluate((_) => _.whenReady.promise);
    const scene = await babylon.evaluateHandle((_) => _.scene);
    return { babylon, scene };
}

interface Component<ElemCls, BabylonCls> {
    ref: Locator,
    elem: ElementHandle<ElemCls>,
    inst?: JSHandle<BabylonCls> 
}

export async function pickComponent<ElementCls, BabylonCls>(page: Page, selector: string, prop: string): Promise<Component<ElementCls, BabylonCls>> {
    const ref = page.locator(selector);
    await ref.waitFor({ state: "attached" });
    const elem = (await ref.elementHandle()) as ElementHandle<ElementCls>;
    // @ts-ignore
    const inst = await elem.evaluateHandle((_, p) => _[p], prop) as JSHandle<BabylonCls>;
    expect(await inst.evaluate(_ => _ != null)).toBe(true);
    return { ref, elem, inst };
}