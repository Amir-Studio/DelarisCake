import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import { parse } from "parse5";

const root = process.cwd();
const htmlFiles = ["index.html", "dashboard.html", "menu.html", "about.html", "cart.html", "payment.html"];
const errors = [];
for (const file of htmlFiles) {
  const source = await fs.readFile(path.join(root, file), "utf8");
  const parseErrors = [];
  parse(source, { onParseError: error => parseErrors.push(error) });
  if (parseErrors.length) errors.push(file + ": " + parseErrors.map(e => e.code + "@" + e.startLine).join(", "));
}
const css = await fs.readFile(path.join(root, "style.css"), "utf8");
postcss.parse(css, { from: "style.css" });
for (const file of ["script.js", "home.js", "scripts/optimize-images.mjs"]) {
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) errors.push(file + ": " + (result.stderr || result.stdout));
}
const manifest = JSON.parse(await fs.readFile(path.join(root, "assets/optimized/image-manifest.json"), "utf8"));
for (const item of manifest) {
  const file = path.join(root, item.output);
  try {
    const stat = await fs.stat(file);
    if (stat.size !== item.outputBytes) errors.push(item.output + ": size mismatch");
  } catch {
    errors.push(item.output + ": missing optimized image");
  }
}
const sources = [...htmlFiles, "script.js"].map(file => fs.readFile(path.join(root, file), "utf8"));
const combined = (await Promise.all(sources)).join("\n");
const refs = [...new Set([...combined.matchAll(/assets\/optimized\/[A-Za-z0-9_./-]+\.(?:webp|jpg)/g)].map(match => match[0]))];
for (const ref of refs) {
  try { await fs.access(path.join(root, ref)); } catch { errors.push(ref + ": referenced file missing"); }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Validated " + htmlFiles.length + " HTML pages, style.css, 3 JavaScript files, " + manifest.length + " generated image variants, and " + refs.length + " optimized references.");
