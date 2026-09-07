import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"]);
const MAX_BYTES = 20 * 1024 * 1024;

export type SavedImage = { url: string; width: number; height: number };

/** ინახავს სურათს public/uploads/YYYY/MM/-ში, ამცირებს და გარდაქმნის webp-ად (SVG უცვლელი რჩება). */
export async function saveImage(file: File, opts: { maxSize?: number; quality?: number } = {}): Promise<SavedImage> {
  if (!ALLOWED.has(file.type)) throw new Error(`დაუშვებელი ფაილის ტიპი: ${file.type || "უცნობი"}`);
  if (file.size > MAX_BYTES) throw new Error("ფაილი ძალიან დიდია (მაქს. 20MB)");

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dir = path.join(process.cwd(), "public", "uploads", yyyy, mm);
  await fs.mkdir(dir, { recursive: true });
  const name = randomBytes(8).toString("hex");
  const buf = Buffer.from(await file.arrayBuffer());

  if (file.type === "image/svg+xml") {
    await fs.writeFile(path.join(dir, `${name}.svg`), buf);
    return { url: `/uploads/${yyyy}/${mm}/${name}.svg`, width: 0, height: 0 };
  }

  const maxSize = opts.maxSize ?? 1800;
  const pipeline = sharp(buf, { animated: false })
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .webp({ quality: opts.quality ?? 84 });
  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  await fs.writeFile(path.join(dir, `${name}.webp`), data);
  return { url: `/uploads/${yyyy}/${mm}/${name}.webp`, width: info.width, height: info.height };
}

/** წაშლის ატვირთულ ფაილს, თუ ის uploads საქაღალდეშია (გარე URL-ებს არ ეხება). */
export async function deleteUploaded(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const safe = path.normalize(url).replace(/^([/\\])+/, "");
  const full = path.join(process.cwd(), "public", safe);
  if (!full.startsWith(path.join(process.cwd(), "public", "uploads"))) return;
  await fs.rm(full, { force: true });
}
