/**
 * სათაურების „კაპიტალიზაცია“ OBSIDIAN-ის სტილში:
 *  - ქართული მხედრული -> მთავრული (Mtavruli, U+1C90–U+1CBF)
 *  - ლათინური და სხვა ასოები -> uppercase
 *
 * ბრაუზერები text-transform: uppercase-ს ქართულზე განზრახ არ იყენებენ (და Chromium მთავრულსაც
 * მხედრულად ხატავს ამ თვისების ქვეშ), ამიტომ ასოებს პირდაპირ ტექსტში ვცვლით.
 */
export function toMtavruli(text: string): string {
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if ((cp >= 0x10d0 && cp <= 0x10fa) || (cp >= 0x10fd && cp <= 0x10ff)) {
      out += String.fromCodePoint(cp - 0x10d0 + 0x1c90);
    } else if (cp >= 0x1c90 && cp <= 0x1cbf) {
      out += ch; // უკვე მთავრულია
    } else {
      out += ch.toUpperCase();
    }
  }
  return out;
}
