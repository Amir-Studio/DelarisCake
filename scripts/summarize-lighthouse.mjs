import fs from "node:fs/promises";

const files = [
  "lighthouse-home-mobile.json", "lighthouse-home-desktop.json",
  "lighthouse-gallery-mobile.json", "lighthouse-gallery-desktop.json",
  "lighthouse-menu-mobile.json", "lighthouse-menu-desktop.json",
  "lighthouse-about-mobile.json", "lighthouse-about-desktop.json",
  "lighthouse-cart-mobile.json", "lighthouse-cart-desktop.json",
  "lighthouse-payment-mobile.json", "lighthouse-payment-desktop.json"
];
const rows = [];
for (const file of files) {
  try {
    const report = JSON.parse(await fs.readFile(file, "utf8"));
    const score = name => {
      const value = report.categories[name]?.score;
      return value == null ? "n/a" : Math.round(value * 100);
    };
    const audit = id => report.audits[id]?.displayValue ?? "n/a";
    rows.push("| " + file.replace("lighthouse-", "").replace(".json", "") +
      " | " + score("performance") + " | " + score("accessibility") +
      " | " + score("best-practices") + " | " + score("seo") +
      " | " + audit("largest-contentful-paint") + " | " +
      audit("cumulative-layout-shift") + " | " + audit("total-blocking-time") + " |");
  } catch {}
}
const summary = [
  "## Lighthouse results",
  "| Test | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |",
  "|---|---:|---:|---:|---:|---:|---:|---:|",
  ...rows
].join("\n");
await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
console.log(summary);
