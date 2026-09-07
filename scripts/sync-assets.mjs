// ფონტებისა და ლოგოს სინქრონიზაცია:
//   fonts/  -> public/fonts/ + src/app/fonts.css (@font-face წესები)
//   brand/  -> public/brand/
// გენერირდება src/generated/assets.json, რომელსაც layout-ები კითხულობენ.
//
// fonts/fonts.json (თუ არსებობს) ზუსტად აღწერს ფაილებს (family, style, weight, stretch).
// აღუწერელი ფაილებისთვის წონა/სტილი სახელიდან გამოიცნობა (GoogleSans-Bold.ttf, GoogleSansFlex-Black.otf …).
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fontsSrc = path.join(root, "fonts");
const fontsDst = path.join(root, "public", "fonts");
const brandSrc = path.join(root, "brand");
const brandDst = path.join(root, "public", "brand");
const outCss = path.join(root, "src", "app", "fonts.css");
const outJson = path.join(root, "src", "generated", "assets.json");

const FORMATS = { ".woff2": "woff2", ".woff": "woff", ".ttf": "truetype", ".otf": "opentype" };
// თანმიმდევრობა მნიშვნელოვანია: "extrabold"/"semibold" უნდა შემოწმდეს "bold"-ზე ადრე
const WEIGHTS = [
  ["extrabold", 800], ["ultrabold", 800], ["semibold", 600], ["demibold", 600],
  ["extralight", 200], ["ultralight", 200], ["hairline", 100], ["thin", 100],
  ["light", 300], ["medium", 500], ["heavy", 900], ["black", 900], ["bold", 700],
  ["regular", 400], ["normal", 400], ["book", 400],
];

function detect(fileName) {
  const base = fileName.replace(/\.[a-z0-9]+$/i, "");
  const n = base.toLowerCase().replace(/[-_ ]/g, "");
  const family = /^googlesansflex/.test(n) ? "Google Sans Flex" : "Google Sans";
  const italic = /italic|oblique/.test(n);
  const variable = /variable|\[[a-z,]+\]|wght|(^|[^a-z])vf([^a-z]|$)/i.test(base);
  let weight = 400;
  for (const [k, w] of WEIGHTS) {
    if (n.includes(k)) { weight = w; break; }
  }
  return { family, weight, italic, variable };
}

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }
function clean(dir) {
  ensureDir(dir);
  for (const f of fs.readdirSync(dir)) {
    if (f !== ".gitkeep") fs.rmSync(path.join(dir, f), { recursive: true, force: true });
  }
}
function face({ family, file, format, weight, style, stretch }) {
  const lines = [
    "@font-face {",
    `  font-family: "${family}";`,
    `  src: url("/fonts/${encodeURI(file)}") format("${format}");`,
    `  font-weight: ${weight};`,
    `  font-style: ${style};`,
  ];
  if (stretch) lines.push(`  font-stretch: ${stretch};`);
  lines.push("  font-display: swap;", "}");
  return lines.join("\n");
}

// ---- fonts ----
const faces = [];
const families = new Set();
const staticWeights = new Set();
clean(fontsDst);
if (fs.existsSync(fontsSrc)) {
  let described = [];
  const sidecar = path.join(fontsSrc, "fonts.json");
  if (fs.existsSync(sidecar)) {
    try {
      described = JSON.parse(fs.readFileSync(sidecar, "utf8")).faces ?? [];
    } catch (e) {
      console.warn("[sync-assets] fonts/fonts.json ვერ წავიკითხე:", e.message);
    }
  }
  const handled = new Set();
  for (const d of described) {
    const file = d.file;
    const ext = path.extname(file).toLowerCase();
    if (!file || !FORMATS[ext] || !fs.existsSync(path.join(fontsSrc, file))) continue;
    fs.copyFileSync(path.join(fontsSrc, file), path.join(fontsDst, file));
    handled.add(file);
    const family = d.family || "Google Sans";
    families.add(family);
    faces.push(face({ family, file, format: FORMATS[ext], weight: d.weight || "400", style: d.style || "normal", stretch: d.stretch }));
  }
  for (const f of fs.readdirSync(fontsSrc)) {
    const ext = path.extname(f).toLowerCase();
    if (!FORMATS[ext] || handled.has(f)) continue;
    fs.copyFileSync(path.join(fontsSrc, f), path.join(fontsDst, f));
    const { family, weight, italic, variable } = detect(f);
    families.add(family);
    if (!variable) staticWeights.add(weight);
    faces.push(face({ family, file: f, format: FORMATS[ext], weight: variable ? "100 900" : String(weight), style: italic ? "italic" : "normal" }));
  }
}
const hasLocalFonts = faces.length > 0;
ensureDir(path.dirname(outCss));
fs.writeFileSync(
  outCss,
  hasLocalFonts
    ? `/* გენერირებულია scripts/sync-assets.mjs-ით - ხელით ნუ შეცვლი. ლოკალური ფონტები: ${[...families].join(", ")} (${faces.length} ფაილი) */\n\n${faces.join("\n\n")}\n`
    : "/* გენერირებულია scripts/sync-assets.mjs-ით. fonts/ საქაღალდე ცარიელია - ფონტები Google Fonts-იდან იტვირთება. */\n"
);

// ---- brand ----
clean(brandDst);
let logo = null;
let logoWhite = null;
if (fs.existsSync(brandSrc)) {
  for (const f of fs.readdirSync(brandSrc)) {
    const m = /^(logo|logo-white)\.(svg|png|webp|jpg|jpeg)$/i.exec(f);
    if (!m) continue;
    const lower = f.toLowerCase();
    fs.copyFileSync(path.join(brandSrc, f), path.join(brandDst, lower));
    const url = `/brand/${lower}`;
    if (m[1].toLowerCase() === "logo") logo = logo && logo.endsWith(".svg") ? logo : url;
    else logoWhite = logoWhite && logoWhite.endsWith(".svg") ? logoWhite : url;
  }
}

ensureDir(path.dirname(outJson));
const meta = {
  localGoogleSans: families.has("Google Sans"),
  localGoogleSansFlex: families.has("Google Sans Flex"),
  localFamilies: [...families],
  localWeights: [...staticWeights].sort((a, b) => a - b),
  logo,
  logoWhite,
  generatedAt: new Date().toISOString(),
};
fs.writeFileSync(outJson, JSON.stringify(meta, null, 2) + "\n");
console.log(
  `[sync-assets] ფონტები: ${hasLocalFonts ? [...families].join(" + ") + ` (${faces.length} ფაილი, ლოკალური)` : "არ არის (Google Fonts)"}; ლოგო: ${logo ?? "არ არის (ტექსტური)"}${logoWhite ? "; თეთრი ლოგო: " + logoWhite : ""}`
);
