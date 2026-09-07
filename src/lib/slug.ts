const GEORGIAN: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k",
  ლ: "l", მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u",
  ფ: "p", ქ: "q", ღ: "gh", ყ: "y", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts",
  ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};

export function transliterate(input: string): string {
  return Array.from(input)
    .map((ch) => GEORGIAN[ch] ?? ch)
    .join("");
}

export function slugify(input: string): string {
  return transliterate(input)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function randomSuffix(len = 4): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
