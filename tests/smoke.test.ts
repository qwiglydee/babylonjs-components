import { ElementHandle, expect, test } from "@playwright/test";

import type { MainElemBase } from "../src/my/base/main";
import { loadPage } from "./testpage";

test("headless", async ({ page }) => {
    await loadPage(page, "<test-babylon-headless></test-babylon-headless>");
    const elem = page.locator('test-babylon-headless');
    await expect(elem).toBeAttached();
    await expect(elem).toHaveJSProperty('isReady', true);

    const babylon = await elem.elementHandle() as ElementHandle<MainElemBase>;
    const scene = await babylon.evaluateHandle((_) => _.scene);

    expect(babylon).toBeDefined();
    expect(scene).toBeDefined();

    expect(await scene.evaluate(_ => _.isReady())).toBe(true);
    expect(await scene.evaluate(_ => _.getNodes().length)).toBe(0);
});

test("augmented", async ({ page }) => {
    await loadPage(page, `
        <test-babylon-headless>
            <test-something></test-something>
        </test-babylon-headless>
    `);
    const elem = page.locator('test-babylon-headless');
    await expect(elem).toBeAttached();
    await expect(elem).toHaveJSProperty('isReady', true);

    const babylon = await elem.elementHandle() as ElementHandle<MainElemBase>;
    const scene = await babylon.evaluateHandle((_) => _.scene);

    expect(babylon).toBeDefined();
    expect(scene).toBeDefined();

    expect(await scene.evaluate(_ => _.isReady())).toBe(true);
    expect(await scene.evaluate(_ => _.rootNodes.length)).toBe(1);
});

test("shadowed", async ({ page }) => {
    await loadPage(page, "<test-babylon-shadowed></test-babylon-shadowed>");
    const elem = page.locator('test-babylon-shadowed');
    await expect(elem).toBeAttached();
    await expect(elem).toHaveJSProperty('isReady', true);

    const babylon = await elem.elementHandle() as ElementHandle<MainElemBase>;
    const scene = await babylon.evaluateHandle((_) => _.scene);

    expect(babylon).toBeDefined();
    expect(scene).toBeDefined();

    expect(await scene.evaluate(_ => _.isReady())).toBe(true);
    expect(await scene.evaluate(_ => _.rootNodes.length)).toBe(1);
});
