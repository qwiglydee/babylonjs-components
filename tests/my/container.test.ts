import { expect, test } from "@playwright/test";
import { loadBabylonHeadful } from "../mypage";
import { pickComponent } from "../testpage";

import { TestWatchElem } from "../../src/testing";

test("empty", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-watch></test-watch>
    `
    );
    const watch = await pickComponent<TestWatchElem, unknown>(page, "test-watch");

    expect(await babylon.evaluate((_) => _.model.isEmpty)).toBe(true);
    expect(await watch.elem.innerText()).toEqual("0");
});

test("static", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-mesh></test-mesh>
        <test-watch></test-watch>
    `
    );
    const watch = await pickComponent<TestWatchElem, unknown>(page, "test-watch");

    expect(await babylon.evaluate((_) => _.model.isEmpty)).toBe(false);
    expect(await watch.elem.innerText()).toEqual("1");
});

test("dynamic", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-watch></test-watch>
    `
    );
    const watch = await pickComponent<TestWatchElem, unknown>(page, "test-watch");

    expect(await babylon.evaluate((_) => _.model.isEmpty)).toBe(true);
    expect(await watch.elem.innerText()).toEqual("0");

    await babylon.evaluate((_) => _.appendChild(_.ownerDocument.createElement("test-mesh")));

    expect(await babylon.evaluate((_) => _.model.isEmpty)).toBe(false);
    expect(await watch.elem.innerText()).toEqual("1");

    await babylon.evaluate((_) => _.removeChild(_.querySelector("test-mesh")!))

    expect(await babylon.evaluate((_) => _.model.isEmpty)).toBe(true);
    expect(await watch.elem.innerText()).toEqual("0");
});
