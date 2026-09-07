"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, LoaderCircle, X } from "lucide-react";
import clsx from "clsx";

export async function uploadFiles(files: File[], maxSize = 1800): Promise<{ url: string; width: number; height: number }[]> {
  const fd = new FormData();
  for (const f of files) fd.append("files", f);
  fd.append("maxSize", String(maxSize));
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = (await res.json()) as { files?: { url: string; width: number; height: number }[]; error?: string };
  if (!res.ok || !json.files) throw new Error(json.error ?? "ატვირთვა ვერ მოხერხდა");
  return json.files;
}

type Props = {
  name: string;
  label?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (url: string) => void;
  hint?: string;
  aspect?: string; // tailwind aspect კლასი, მაგ. "aspect-video"
  maxSize?: number;
};

/** ერთი სურათის ველი: ატვირთვა ან URL-ის ჩაწერა. მნიშვნელობა hidden input-ში ინახება. */
export function ImageField({ name, label, defaultValue = "", value, onChange, hint, aspect = "aspect-[4/3]", maxSize = 1800 }: Props) {
  const [internal, setInternal] = useState(defaultValue);
  const url = value ?? internal;
  const set = (v: string) => {
    setInternal(v);
    onChange?.(v);
  };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const [saved] = await uploadFiles([file], maxSize);
      set(saved.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "შეცდომა");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {label ? <span className="mb-1.5 block text-[13px] font-medium">{label}</span> : null}
      <input type="hidden" name={name} value={url} />
      <div className="flex gap-3">
        <div className={clsx("relative w-40 shrink-0 overflow-hidden rounded-xl border border-line bg-cream", aspect)}>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-muted-2">
              <ImagePlus className="h-6 w-6" />
            </div>
          )}
          {busy ? (
            <div className="absolute inset-0 grid place-items-center bg-white/70">
              <LoaderCircle className="h-5 w-5 animate-spin" />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="btn btn-outline btn-sm">
            <ImagePlus className="h-4 w-4" /> ატვირთვა
          </button>
          <button type="button" onClick={() => setShowUrl((v) => !v)} className="btn btn-outline btn-sm">
            <Link2 className="h-4 w-4" /> URL
          </button>
          {url ? (
            <button type="button" onClick={() => set("")} className="btn btn-sm text-danger hover:bg-danger/10">
              <X className="h-4 w-4" /> წაშლა
            </button>
          ) : null}
        </div>
      </div>
      {showUrl ? <input value={url} onChange={(e) => set(e.target.value.trim())} placeholder="https://…" className="field mt-2 h-10 text-sm" /> : null}
      {error ? <p className="mt-1 text-[12px] text-danger">{error}</p> : null}
      {hint ? <p className="mt-1 text-[12px] text-muted">{hint}</p> : null}
    </div>
  );
}
