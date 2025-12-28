import { Page } from "@playwright/test";

export async function loadPage(page: Page, html: string) {
    await page.goto("testpage.html", { waitUntil: "domcontentloaded" })
    const loaded = page.waitForEvent('load');
    const elem = await page.locator("main").elementHandle();
    await elem!.evaluate((elem, html) => (elem!.innerHTML = html), html);
    await loaded;
}