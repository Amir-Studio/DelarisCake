import { chromium } from "playwright";

const base = (process.env.BASE_URL || "https://amir-studio.github.io/DelarisCake").replace(/\/$/, "");
const pages = ["/", "/dashboard.html", "/menu.html", "/about.html", "/cart.html", "/payment.html"];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1365, height: 900 }
];
const browser = await chromium.launch({ headless: true });
const results = [];
const failures = [];

try {
  for (const viewport of viewports) {
    for (const route of pages) {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
      const pageErrors = [];
      page.on("pageerror", error => pageErrors.push(error.message));
      const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
      if (!response || !response.ok()) failures.push(route + " " + viewport.name + ": HTTP " + (response?.status() ?? "no response"));
      await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: document.documentElement.clientWidth,
        title: document.title,
        h1: document.querySelectorAll("h1").length
      }));
      if (layout.width > layout.viewport + 1) failures.push(route + " " + viewport.name + ": horizontal overflow " + layout.width + "/" + layout.viewport);
      if (pageErrors.length) failures.push(route + " " + viewport.name + ": JS " + pageErrors.join(" | "));

      const links = await page.locator("a[href]").evaluateAll(nodes => nodes.map(a => a.href).filter(href => {
        const u = new URL(href);
        return u.origin === location.origin && !u.hash;
      }));
      for (const href of [...new Set(links)]) {
        const check = await page.request.get(href);
        if (!check.ok()) failures.push(route + " " + viewport.name + ": broken internal link " + href + " (" + check.status() + ")");
      }

      if (route === "/dashboard.html") {
        const gallery = await page.evaluate(() => {
          const images = [...document.querySelectorAll("#cakeGrid img")];
          return {
            count: images.length,
            firstLoading: images[0]?.loading,
            firstPriority: images[0]?.getAttribute("fetchpriority"),
            allHaveDimensions: images.every(img => Number(img.getAttribute("width")) > 0 && Number(img.getAttribute("height")) > 0),
            allHaveSrcset: images.every(img => Boolean(img.getAttribute("srcset")))
          };
        });
        if (gallery.count !== 15) failures.push("gallery " + viewport.name + ": expected 15 images, found " + gallery.count);
        if (gallery.firstLoading !== "eager" || gallery.firstPriority !== "high") failures.push("gallery " + viewport.name + ": first image is not eager/high priority");
        if (!gallery.allHaveDimensions || !gallery.allHaveSrcset) failures.push("gallery " + viewport.name + ": image dimensions/srcset missing");
        await page.locator("#cakeGrid img").evaluateAll(async images => {
          for (const img of images) {
            img.scrollIntoView();
            await img.decode().catch(() => {});
          }
          window.scrollTo(0, 0);
        });
        const loaded = await page.locator("#cakeGrid img").evaluateAll(images => images.filter(img => img.complete && img.naturalWidth > 0).length);
        if (loaded !== 15) failures.push("gallery " + viewport.name + ": only " + loaded + "/15 gallery images decoded");
        results.push({ route, viewport: viewport.name, gallery });
      }

      if (route === "/cart.html" || route === "/payment.html") {
        const instagram = await page.locator('a[href*="instagram.com/delaris_cake07"]').count();
        if (!instagram) failures.push(route + " " + viewport.name + ": expected order/contact CTA missing");
      }
      results.push({ route, viewport: viewport.name, status: response?.status(), ...layout, jsErrors: pageErrors.length });
      await page.close();
    }
  }

  const signup = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await signup.goto(base + "/menu.html", { waitUntil: "domcontentloaded" });
  await signup.locator("#fullName").fill("تست خودکار");
  await signup.locator("#age").fill("25");
  await signup.locator("#email").fill("qa@example.com");
  await signup.locator('#registerForm button[type="submit"]').click();
  await signup.waitForURL("**/dashboard.html", { timeout: 10000 });
  const storedUser = await signup.evaluate(() => JSON.parse(localStorage.getItem("user") || "null"));
  if (!storedUser || storedUser.email !== "qa@example.com") failures.push("registration: localStorage user not saved or redirect failed");
  results.push({ feature: "registration", passed: Boolean(storedUser), redirect: signup.url() });
  await signup.close();

  if (failures.length) {
    console.error(JSON.stringify({ passed: false, failures, results }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ passed: true, failures: [], results }, null, 2));
  }
} finally {
  await browser.close();
}
