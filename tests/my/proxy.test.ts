import { expect, JSHandle, test } from "@playwright/test";

import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { type TestMeshElem } from "../../src/testing";
import { MyProxyElem } from "../../src/my/elements/proxy";

import { pickComponent } from "../testpage";
import { loadBabylonHeadful } from "../mypage";

test("default", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <my3d-proxy></my3d-proxy>
    `
    );
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    expect(proxy.ref).toHaveJSProperty("for", "");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toBeUndefined();
    expect(proxy.ref).toHaveJSProperty("enabled", true);
    expect(proxy.ref).toHaveJSProperty("visible", true);
});

test("invalid", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-mesh id="foo"></test-mesh>
        <my3d-proxy for="bar"></my3d-proxy>
    `
    );
    const inst = scene.evaluateHandle(_ => _.getMeshById('foo'));
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    expect(proxy.ref).toHaveJSProperty("for", "bar");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toBeUndefined();
    expect(proxy.ref).toHaveJSProperty("enabled", true);
    expect(proxy.ref).toHaveJSProperty("visible", true);
});

test("static link", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-mesh id="foo"></test-mesh>
        <my3d-proxy for="foo"></my3d-proxy>
    `
    );
    const target = (await scene.evaluateHandle(_ => _.getMeshById('foo'))) as JSHandle<Mesh>;
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("something");
    expect(proxy.ref).toHaveJSProperty("enabled", true);
    expect(proxy.ref).toHaveJSProperty("visible", true);

    expect(await target.evaluate((_) => _.isVisible)).toBe(true);
    expect(await target.evaluate((_) => _.isEnabled())).toBe(true);
});

test("sync props", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-mesh id="foo"></test-mesh>
        <my3d-proxy for="foo"></my3d-proxy>
    `
    );
    const target = (await scene.evaluateHandle(_ => _.getMeshById('foo'))) as JSHandle<Mesh>;
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    await proxy.elem.evaluate((_) => (_.visible = false));
    await proxy.elem.evaluate((_) => (_.enabled = false));

    expect(await target.evaluate((_) => _.isVisible)).toBe(false);
    expect(await target.evaluate((_) => _.isEnabled())).toBe(false);
});

test("dynamic target", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <my3d-proxy for="foo"></my3d-proxy>
    `
    );
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    babylon.evaluate((_) => {
        const elem = _.ownerDocument.createElement("test-mesh");
        elem.id = "foo";
        _.appendChild(elem);
    });
    const target = (await scene.evaluateHandle(_ => _.getMeshById('foo'))) as JSHandle<Mesh>;

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("something");
    expect(proxy.ref).toHaveJSProperty("enabled", true);
    expect(proxy.ref).toHaveJSProperty("visible", true);

    expect(await target.evaluate((_) => _.isVisible)).toBe(true);
    expect(await target.evaluate((_) => _.isEnabled())).toBe(true);
});

test("dynamic target overriding props", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <my3d-proxy for="foo" hidden></my3d-proxy>
    `
    );
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    babylon.evaluate((_) => {
        const elem = _.ownerDocument.createElement("test-mesh");
        elem.id = "foo";
        _.appendChild(elem);
    });
    const target = (await scene.evaluateHandle(_ => _.getMeshById('foo'))) as JSHandle<Mesh>;

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(proxy.ref).toHaveJSProperty("enabled", true);
    expect(proxy.ref).toHaveJSProperty("visible", false);
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("something");

    expect(await target.evaluate((_) => _.isEnabled())).toBe(true);
    expect(await target.evaluate((_) => _.isVisible)).toBe(false);
});

test("dynamic proxy", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-mesh id="foo"></test-mesh>
    `
    );
    const target = (await scene.evaluateHandle(_ => _.getMeshById('foo'))) as JSHandle<Mesh>;

    babylon.evaluate((_) => {
        const elem = _.ownerDocument.createElement("my3d-proxy") as MyProxyElem;
        elem.for = "foo";
        _.appendChild(elem);
    });
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("something");
    expect(proxy.ref).toHaveJSProperty("enabled", true);
    expect(proxy.ref).toHaveJSProperty("visible", true);

    expect(await target.evaluate((_) => _.isVisible)).toBe(true);
    expect(await target.evaluate((_) => _.isEnabled())).toBe(true);
});

test("dynamic proxy peeking props", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-mesh id="foo" disabled></test-mesh>
    `
    );
    const target = (await scene.evaluateHandle(_ => _.getMeshById('foo'))) as JSHandle<Mesh>;

    babylon.evaluate((_) => {
        const elem = _.ownerDocument.createElement("my3d-proxy") as MyProxyElem;
        elem.for = "foo";
        _.appendChild(elem);
    });
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("something");
    expect(proxy.ref).toHaveJSProperty("enabled", false);
    expect(proxy.ref).toHaveJSProperty("visible", false);

    expect(await target.evaluate((_) => _.isVisible)).toBe(false);
    expect(await target.evaluate((_) => _.isEnabled())).toBe(false);
});

test("retargeting", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-mesh id="foo" name="foothing"></test-mesh>
        <test-mesh id="bar" name="barthing"></test-mesh>
        <my3d-proxy for="foo"></my3d-proxy>
    `
    );
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("foothing");

    await proxy.elem.evaluate((_) => (_.for = "bar"));

    expect(proxy.ref).toHaveJSProperty("for", "bar");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("barthing");
});

test("replacing", async ({ page }) => {
    const { babylon, scene } = await loadBabylonHeadful(
        page,
        `
        <test-mesh id="foo" name="foo1thing"></test-mesh>
        <my3d-proxy for="foo"></my3d-proxy>
    `
    );
    const proxy = await pickComponent<MyProxyElem, unknown>(page, "my3d-proxy");

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("foo1thing");

    await babylon.evaluate((_) => {
        const elem = _.querySelector("#foo");
        _.removeChild(elem!);
    });

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toBeUndefined();

    await babylon.evaluate((_) => {
        const elem = _.ownerDocument.createElement("test-mesh") as TestMeshElem;
        elem.name = "foo2thing";
        elem.id = "foo";
        _.appendChild(elem);
    });

    expect(proxy.ref).toHaveJSProperty("for", "foo");
    expect(await proxy.elem.evaluate((_) => _._target?.name)).toEqual("foo2thing");
});
