import { NextResponse, type NextRequest } from "next/server";
import { getAdmin } from "@/lib/auth";
import { saveImage } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return NextResponse.json({ error: "ფაილი არ არის" }, { status: 400 });
  const maxSize = Number(form.get("maxSize") ?? 1800) || 1800;

  try {
    const saved = [];
    for (const file of files.slice(0, 12)) saved.push(await saveImage(file, { maxSize }));
    return NextResponse.json({ files: saved });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "ატვირთვა ვერ მოხერხდა" }, { status: 400 });
  }
}
