// ფასები ბაზაში ინახება თეთრებში (მთელი რიცხვი). 259.90 ₾ = 25990.

export function formatPrice(tetri: number): string {
  const gel = tetri / 100;
  const fixed = Number.isInteger(gel) ? gel.toString() : gel.toFixed(2);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped}${dec ? "." + dec : ""} ₾`;
}

export function toTetri(gel: number | string): number {
  const n = typeof gel === "string" ? Number(gel.replace(",", ".")) : gel;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function toGel(tetri: number): number {
  return tetri / 100;
}

export function gelInput(tetri: number | null | undefined): string {
  if (tetri == null) return "";
  const gel = tetri / 100;
  return Number.isInteger(gel) ? String(gel) : gel.toFixed(2);
}
