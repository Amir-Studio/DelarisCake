import fs from "node:fs/promises";
const files = ["lighthouse-home-mobile.json", "lighthouse-home-desktop.json", "lighthouse-about-mobile.json", "lighthouse-dashboard-mobile.json", "lighthouse-menu-mobile.json"];
const rows = [];
for (const file of files) {
  try {
    const report = JSON.parse(await fs.readFile(file, "utf8"));
    const score = name => Math.round((report.categories[name]?.score ?? 0) * 100);
    const audit = id => report.audits[id]?.displayValue ?? "n/a";
    rows.push("| " + file.replace("lighthouse-", "").replace(".json", "") + " | " + score("performance") + " | " + score("accessibility") + " | " + score("best-practices") + " | " + score("seo") + " | " + audit("largest-contentful-paint") + " | " + audit("cumulative-layout-shift") + " |");
  } catch {}
}
const summary = [
  "## Lighthouse results",
  "| Test | Performance | Accessibility | Best practices | SEO | LCP | CLS |",
  "|---|---:|---:|---:|---:|---:|---:|",
  ...rows
].join("\n");
await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, summary + "\n");
console.log(summary);
