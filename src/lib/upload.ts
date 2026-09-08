import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/svg+xml"]);

/** Vercel Blob ჩართულია, თუ ტოკენი არსებობს (Vercel-ზე ფაილურ სისტემაში ჩაწერა შეუძლებელია). */
const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
/** Vercel-ის serverless ფუნქციას რექვესთის ლიმიტი ~4.5MB აქვს. */
const MAX_BYTES = process.env.VERCEL ? 4 * 1024 * 1024 : 20 * 1024 * 1024;

export type SavedImage = { url: string; width: number; height: number };

function limitLabel(): string {
  return `${Math.round(MAX_BYTES / (1024 * 1024))}MB`;
}

/**
 * ინახავს სურათს და აბრუნებს საჯარო URL-ს.
 * Vercel-ზე — Vercel Blob-ში, ლოკალურად/VPS-ზე — public/uploads/YYYY/MM/-ში.
 * სურათი მცირდება და გარდაიქმნება webp-ად (SVG უცვლელი რჩება).
 */
export async function saveImage(file: File, opts: { maxSize?: number; quality?: number } = {}): Promise<SavedImage> {
  if (!ALLOWED.has(file.type)) throw new Error(`დაუშვებელი ფაილის ტიპი: ${file.type || "უცნობი"}`);
  if (file.size > MAX_BYTES) throw new Error(`ფაილი ძალიან დიდია (მაქს. ${limitLabel()})`);

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const name = randomBytes(8).toString("hex");
  const buf = Buffer.from(await file.arrayBuffer());

  let data: Buffer;
  let ext: string;
  let contentType: string;
  let width = 0;
  let height = 0;

  if (file.type === "image/svg+xml") {
    data = buf;
    ext = "svg";
    contentType = "image/svg+xml";
  } else {
    const maxSize = opts.maxSize ?? 1800;
    const result = await sharp(buf, { animated: false })
      .rotate()
      .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
      .webp({ quality: opts.quality ?? 84 })
      .toBuffer({ resolveWithObject: true });
    data = result.data;
    width = result.info.width;
    height = result.info.height;
    ext = "webp";
    contentType = "image/webp";
  }

  const pathname = `uploads/${yyyy}/${mm}/${name}.${ext}`;

  if (useBlob) {
    const { put } = await import("@vercel/blob");
    const blob = await put(pathname, data, { access: "public", contentType, addRandomSuffix: false });
    return { url: blob.url, width, height };
  }

  const dir = path.join(process.cwd(), "public", "uploads", yyyy, mm);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `${name}.${ext}`), data);
  return { url: `/${pathname}`, width, height };
}

/** წაშლის ატვირთულ ფაილს (Blob ან ლოკალური uploads). გარე URL-ებს არ ეხება. */
export async function deleteUploaded(url: string): Promise<void> {
  if (useBlob && /^https?:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//i.test(url)) {
    const { del } = await import("@vercel/blob");
    await del(url).catch(() => {});
    return;
  }
  if (!url.startsWith("/uploads/")) return;
  const safe = path.normalize(url).replace(/^([/\\])+/, "");
  const full = path.join(process.cwd(), "public", safe);
  if (!full.startsWith(path.join(process.cwd(), "public", "uploads"))) return;
  await fs.rm(full, { force: true });
}
