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
      await page.addInitScript(() => {
        window.__measuredCLS = 0;
        window.__clsEntries = [];
        window.__measuredLCP = 0;
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          if (entries.length) window.__measuredLCP = entries[entries.length - 1].startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) window.__measuredCLS += entry.value;
            window.__clsEntries.push({
              value: entry.value,
              hadRecentInput: entry.hadRecentInput,
              sources: (entry.sources || []).map(source => ({
                selector: source.node ? (source.node.tagName?.toLowerCase?.() || source.node.nodeName || "node") + (source.node.id ? "#" + source.node.id : "") + (typeof source.node.className === "string" && source.node.className.trim() ? "." + source.node.className.trim().split(/\\s+/).join(".") : "") : null,
                previousRect: source.previousRect,
                currentRect: source.currentRect
              }))
            });
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      const pageErrors = [];
      const heroRequests = [];
      page.on("pageerror", error => pageErrors.push(error.message));
      page.on("request", request => {
        const pathname = new URL(request.url()).pathname;
        if (pathname.includes("/assets/optimized/hero-") && pathname.endsWith(".webp")) heroRequests.push(request.url());
      });
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
      if (layout.h1 !== 1) failures.push(route + " " + viewport.name + ": expected one primary heading, found " + layout.h1);
      if (!layout.title) failures.push(route + " " + viewport.name + ": page title missing");
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
        const clsBeforeScroll = await page.evaluate(() => window.__measuredCLS || 0);
        await page.locator("#cakeGrid img").evaluateAll(async images => {
          for (const img of images) {
            img.scrollIntoView();
            await img.decode().catch(() => {});
          }
          window.scrollTo(0, 0);
        });
        const loaded = await page.locator("#cakeGrid img").evaluateAll(images => images.filter(img => img.complete && img.naturalWidth > 0).length);
        if (loaded !== 15) failures.push("gallery " + viewport.name + ": only " + loaded + "/15 gallery images decoded");
        const clsData = await page.evaluate(() => ({ value: window.__measuredCLS || 0, entries: window.__clsEntries || [] }));
        const measuredCLS = clsData.value;
        if (measuredCLS > 0.1) failures.push("gallery " + viewport.name + ": browser-observed CLS " + measuredCLS.toFixed(3) + " exceeds 0.1; entries=" + JSON.stringify(clsData.entries.slice(0, 5)));
        results.push({ route, viewport: viewport.name, gallery, browserObservedCLSBeforeScroll: clsBeforeScroll, browserObservedCLS: measuredCLS, layoutShiftEntries: clsData.entries.slice(0, 5) });
      }

      if (route === "/") {
        const hero = await page.evaluate(() => {
          const image = document.querySelector(".hero-image-square");
          const preload = document.querySelector('link[rel="preload"][as="image"]');
          return {
            srcset: image?.getAttribute("srcset") || "",
            preloadSrcset: preload?.getAttribute("imagesrcset") || "",
            hasPreload: Boolean(preload),
            loading: image?.loading || "",
            priority: image?.getAttribute("fetchpriority") || ""
          };
        });
        if (!hero.srcset || hero.srcset !== hero.preloadSrcset) failures.push("homepage " + viewport.name + ": hero preload/srcset mismatch " + JSON.stringify(hero));
        if (hero.loading === "lazy" || hero.priority !== "high") failures.push("homepage " + viewport.name + ": hero image priority incorrect");
        if (heroRequests.length !== 1) failures.push("homepage " + viewport.name + ": expected one hero image request, saw " + heroRequests.length);
        const observedLCP = await page.evaluate(() => window.__measuredLCP || 0);
        if (viewport.name === "mobile" && observedLCP >= 2500) failures.push("homepage mobile: browser-observed LCP " + Math.round(observedLCP) + "ms exceeds 2500ms");
        results.push({ route, viewport: viewport.name, browserObservedLCP: observedLCP });
      }

      if (route === "/menu.html") {
        const menuA11y = await page.evaluate(() => ({
          main: Boolean(document.querySelector("main")),
          description: Boolean(document.querySelector('meta[name="description"]')?.content),
          labels: [...document.querySelectorAll("#registerForm input")].every(input => Boolean(document.querySelector('label[for="' + input.id + '"]'))),
          robots: document.querySelector('meta[name="robots"]')?.content || ""
        }));
        if (!menuA11y.main || !menuA11y.description || !menuA11y.labels || menuA11y.robots.includes("noindex")) failures.push("menu " + viewport.name + ": SEO or form accessibility metadata missing");
        if (viewport.name === "mobile") {
          const focusedIds = [];
          for (let i = 0; i < 3; i++) {
            await page.keyboard.press("Tab");
            focusedIds.push(await page.evaluate(() => document.activeElement?.id || ""));
          }
          if (!["registerTab", "loginTab", "fullName"].every(id => focusedIds.includes(id))) {
            failures.push("menu keyboard: register/login tabs and first field are not all reachable " + JSON.stringify(focusedIds));
          }
        }
      }

      if (route === "/cart.html" || route === "/payment.html") {
        const instagram = await page.locator('a[href*="instagram.com/delaris_cake07"]').count();
        if (!instagram) failures.push(route + " " + viewport.name + ": expected order/contact CTA missing");
      }
      results.push({ route, viewport: viewport.name, status: response?.status(), ...layout, jsErrors: pageErrors.length });
      await page.close();
    }
  }

  const authPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await authPage.goto(base + "/menu.html", { waitUntil: "domcontentloaded" });
  await authPage.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  const authReady = await authPage.evaluate(() => ({
    client: Boolean(window.delarisSupabase?.auth?.signUp && window.delarisSupabase?.auth?.signInWithPassword),
    registerVisible: !document.querySelector("#registerForm")?.hidden,
    loginHidden: Boolean(document.querySelector("#loginForm")?.hidden),
    statusRegion: Boolean(document.querySelector('#authMessage[aria-live="polite"]')),
    passwordMinLength: Number(document.querySelector("#password")?.minLength || 0)
  }));
  if (!authReady.client || !authReady.registerVisible || !authReady.loginHidden || !authReady.statusRegion || authReady.passwordMinLength < 8) {
    failures.push("authentication UI or Supabase client initialization failed " + JSON.stringify(authReady));
  }
  await authPage.locator("#loginTab").click();
  const loginMode = await authPage.evaluate(() => ({
    registerHidden: Boolean(document.querySelector("#registerForm")?.hidden),
    loginVisible: !document.querySelector("#loginForm")?.hidden
  }));
  if (!loginMode.registerHidden || !loginMode.loginVisible) failures.push("login tab did not reveal the login form");
  await authPage.locator("#registerTab").click();
  const registerMode = await authPage.evaluate(() => ({
    registerVisible: !document.querySelector("#registerForm")?.hidden,
    loginHidden: Boolean(document.querySelector("#loginForm")?.hidden)
  }));
  if (!registerMode.registerVisible || !registerMode.loginHidden) failures.push("registration tab did not restore the registration form");
  results.push({
    feature: "authentication-ui-and-supabase-client",
    passed: authReady.client && loginMode.registerHidden && loginMode.loginVisible && registerMode.registerVisible && registerMode.loginHidden,
    liveSignUpAndLoginSubmitted: false
  });
  await authPage.close();

  if (failures.length) {
    console.error(JSON.stringify({ passed: false, failures, results }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ passed: true, failures: [], results }, null, 2));
  }
} finally {
  await browser.close();
}
