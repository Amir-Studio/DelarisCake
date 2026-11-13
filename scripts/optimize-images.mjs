import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const output = path.join(root, "assets", "optimized");
const cakeOutput = path.join(output, "cakes");
const ideaOutput = path.join(output, "ideas");
await fs.mkdir(cakeOutput, { recursive: true });
await fs.mkdir(ideaOutput, { recursive: true });

const logoUrl = "https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/d08d8f3c-45d9-481a-80f5-0a4a1b5382d4.png";
const heroUrl = "https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/7d37175d-444b-4c6d-9140-486c0ce657d0.jpg";
const remote = [
  ["brand-logo", logoUrl, "logo"],
  ["hero", heroUrl, "hero"],
  ["cake-2", "https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/01305b06-e1f1-45c9-b02d-98814c9fbba2.jpg", "cake"],
  ["cake-3", "https://i.supaimg.com/d3484bf0-3568-4b4d-83d8-32004cd9b325/eb0f40a7-4e83-425a-be88-e11c59343653.jpg", "cake"],
  ["idea-101", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85", "idea"],
  ["idea-102", "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1200&q=85", "idea"],
  ["idea-103", "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=85", "idea"],
  ["idea-104", "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1200&q=85", "idea"],
  ["idea-105", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=85", "idea"]
];

async function download(url) {
  const response = await fetch(url, { headers: { "User-Agent": "DelarisCake-ImageOptimizer/1.0" } });
  if (!response.ok) throw new Error("Download failed (" + response.status + "): " + url);
  return Buffer.from(await response.arrayBuffer());
}
const manifest = [];
const localMap = new Map();

async function createResponsiveVariants(input, targetPath, sourceWidth, relativePath, name, sourceBytes) {
  const maximum = Math.min(sourceWidth || 1200, 1200);
  const folder = path.dirname(targetPath);
  const stem = path.basename(targetPath, path.extname(targetPath));
  for (const width of [360, 720]) {
    if (width >= maximum) continue;
    const variantPath = path.join(folder, stem + "-" + width + ".webp");
    await input.clone().rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(variantPath);
    const variantMeta = await sharp(variantPath).metadata();
    manifest.push({
      name: name + "-" + width,
      sourceBytes,
      output: path.relative(root, variantPath).split(path.sep).join("/"),
      outputBytes: (await fs.stat(variantPath)).size,
      width: variantMeta.width,
      height: variantMeta.height
    });
  }
}

for (const item of remote) {
  const name = item[0], url = item[1], kind = item[2];
  const source = await download(url);
  const input = sharp(source, { failOn: "none" });
  const meta = await input.metadata();
  if (kind === "logo") {
    const target = path.join(output, "logo-116.webp");
    await input.clone().resize(116, 116, { fit: "cover", position: "centre" }).webp({ quality: 84, effort: 5 }).toFile(target);
    manifest.push({ name: name, sourceBytes: source.length, output: "assets/optimized/logo-116.webp", outputBytes: (await fs.stat(target)).size, width: 116, height: 116 });
    localMap.set(url, "assets/optimized/logo-116.webp");
  } else if (kind === "hero") {
    for (const width of [240, 480, 960]) {
      const target = path.join(output, "hero-" + width + ".webp");
      await input.clone().resize(width, width, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toFile(target);
      manifest.push({ name: "hero-" + width, sourceBytes: source.length, output: "assets/optimized/hero-" + width + ".webp", outputBytes: (await fs.stat(target)).size, width, height: width });
    }
    const social = path.join(output, "hero-social-1200.jpg");
    await input.clone().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toFile(social);
    manifest.push({ name: "hero-social-1200", sourceBytes: source.length, output: "assets/optimized/hero-social-1200.jpg", outputBytes: (await fs.stat(social)).size });
    localMap.set(url, "assets/optimized/hero-480.webp");
  } else {
    const folder = kind === "idea" ? ideaOutput : cakeOutput;
    const target = path.join(folder, name + ".webp");
    await input.clone().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(target);
    const rel = path.relative(root, target).split(path.sep).join("/");
    manifest.push({ name: name, sourceBytes: source.length, output: rel, outputBytes: (await fs.stat(target)).size, sourceWidth: meta.width, sourceHeight: meta.height, width: Math.min(meta.width || 1200, 1200), height: Math.round(Math.min(meta.width || 1200, 1200) * (meta.height || 1200) / (meta.width || 1200)) });
    await createResponsiveVariants(input, target, meta.width, rel, name, source.length);
    localMap.set(url, rel);
  }
}

const localFiles = (await fs.readdir(path.join(root, "image"))).filter(function(file) {
  const lower = file.toLowerCase();
  return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png");
});
for (const file of localFiles) {
  const sourcePath = path.join(root, "image", file);
  const targetPath = path.join(cakeOutput, path.parse(file).name + ".webp");
  const sourceStat = await fs.stat(sourcePath);
  const sourceImage = sharp(sourcePath, { failOn: "none" });
  const metadata = await sourceImage.metadata();
  await sourceImage.rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(targetPath);
  const rel = path.relative(root, targetPath).split(path.sep).join("/");
  manifest.push({ name: file, sourceBytes: sourceStat.size, output: rel, outputBytes: (await fs.stat(targetPath)).size, sourceWidth: metadata.width, sourceHeight: metadata.height, width: Math.min(metadata.width || 1200, 1200), height: Math.round(Math.min(metadata.width || 1200, 1200) * (metadata.height || 1200) / (metadata.width || 1200)) });
  await createResponsiveVariants(sourceImage, targetPath, metadata.width, rel, file, sourceStat.size);
  localMap.set("https://raw.githubusercontent.com/Amir-Studio/DelarisCake/main/image/" + file, rel);
}

function replaceAll(text, from, to) { return text.split(from).join(to); }
for (const page of ["index.html", "dashboard.html", "about.html"]) {
  const file = path.join(root, page);
  let html = await fs.readFile(file, "utf8");
  if (page === "index.html") {
    html = replaceAll(html, '<link rel="preload" as="image" href="' + heroUrl + '" fetchpriority="high" />', '<link rel="preload" as="image" href="assets/optimized/hero-480.webp" imagesrcset="assets/optimized/hero-480.webp 480w, assets/optimized/hero-960.webp 960w" imagesizes="(max-width: 480px) 188px, 240px" fetchpriority="high" />');
    html = replaceAll(html, '<img src="' + heroUrl + '"', '<img src="assets/optimized/hero-480.webp" srcset="assets/optimized/hero-480.webp 480w, assets/optimized/hero-960.webp 960w" sizes="(max-width: 480px) 188px, 240px"');
    if (!html.includes('class="seo-brand-logo" width="76" height="76"')) html = html.replace('<img class="seo-brand-logo"', '<img class="seo-brand-logo" width="76" height="76"');
    html = html.replace('class="seo-brand-logo" width="76" height="76" src=', 'class="seo-brand-logo" width="76" height="76" decoding="async" src=');
  }
  html = replaceAll(html, logoUrl, "assets/optimized/logo-116.webp");
  html = replaceAll(html, heroUrl, "assets/optimized/hero-social-1200.jpg");
  if (page === "dashboard.html") {
    html = html.replace('class="profile-img" />', 'class="profile-img" width="60" height="60" loading="lazy" decoding="async" />');
    html = html.replace('class="info-logo" />', 'class="info-logo" width="80" height="80" loading="lazy" decoding="async" />');
  }
  await fs.writeFile(file, html);
}

const jsPath = path.join(root, "script.js");
let js = await fs.readFile(jsPath, "utf8");
for (const entry of localMap) js = replaceAll(js, entry[0], entry[1]);
await fs.writeFile(jsPath, js);
await fs.writeFile(path.join(output, "image-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const totalSource = manifest.reduce((sum, item) => sum + item.sourceBytes, 0);
const totalOutput = manifest.reduce((sum, item) => sum + item.outputBytes, 0);
console.log(JSON.stringify({ images: manifest.length, totalSourceBytes: totalSource, totalOutputBytes: totalOutput, savedBytes: totalSource - totalOutput, manifest }, null, 2));
