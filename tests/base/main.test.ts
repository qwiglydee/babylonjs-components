import { ElementHandle, expect, test } from "@playwright/test";

import { TestBabylonElem } from "../../src/testing";
import  { loadBabylonHeadless, loadPage } from "../testpage";

test('init', async ({ page }) => {
    await loadPage(page, `
        <test-babylon>
        </test-babylon>
    `);
    const elem = page.locator('test-babylon');
    await elem.waitFor({ state: 'attached' });
    const babylon = await elem.elementHandle() as ElementHandle<TestBabylonElem>;

    expect(await babylon.evaluate(_ => _.canvas)).toBeDefined();    
    expect(await babylon.evaluate(_ => _.engine)).toBeDefined();    
    expect(await babylon.evaluate(_ => _.scene)).toBeDefined();    
    expect(await babylon.evaluate(_ => _.whenReady)).toBeDefined();    
    expect(await babylon.evaluate(_ => _.isReady)).toBe(true);    

    const scene = await babylon.evaluateHandle((_) => _.scene);
    expect(scene).toBeDefined()
    expect(await scene.evaluate(_ => _.isReady())).toBe(true);
})

test('resizing', async ({ page }) => {
    await page.setViewportSize({ width: 300, height: 200 });
    await loadPage(page, `
        <test-babylon style="display: block; width: 100vw; height: 100vh;">
        </test-babylon>
    `);
    const elem = page.locator('test-babylon');
    const babylon = await elem.elementHandle() as ElementHandle<TestBabylonElem>;
    const engine = await babylon.evaluateHandle((_) => _.engine);

    expect(await engine.evaluate(_ => _.getRenderingCanvasClientRect())).toEqual(expect.objectContaining({ width: 300, height: 200 }))
    
    await page.setViewportSize({ width: 400, height: 300 });

    expect(await engine.evaluate(_ => _.getRenderingCanvasClientRect())).toEqual(expect.objectContaining({ width: 400, height: 300 }))
});

test('suspending', async ({ page }) => {
    await page.setViewportSize({ width: 300, height: 200 });
    await loadPage(page, `
        <style>body { margin: 0; height: 1000px; }</style>
        <test-babylon style="display: block; width: 300px; height: 200px;">
            <test-camera selected></test-camera>
        </test-babylon>
    `);
    const elem = page.locator('test-babylon');
    const babylon = await elem.elementHandle() as ElementHandle<TestBabylonElem>;
    const engine = await babylon.evaluateHandle((_) => _.engine);
    const camera = await babylon.evaluateHandle((_) => _.scene._activeCamera!);

    expect(await engine.evaluate(_ => _.activeRenderLoops.length)).toEqual(1);
    expect(await camera.evaluate(_ => _.isEnabled())).toEqual(true);

    await page.evaluate(_ => window.scrollTo({ top: 151, behavior: 'instant' })); // < 75% of canvas visible
    await page.waitForTimeout(17); // should be wait for animation frame

    expect(await engine.evaluate(_ => _.activeRenderLoops.length)).toEqual(0);
    expect(await camera.evaluate(_ => _.isEnabled())).toEqual(false);
});