# ფონტები — Google Sans (ლოკალური)

აქ დევს საიტის ფონტები. `npm run dev` / `npm run build` (ან `npm run fonts`) ავტომატურად აკოპირებს მათ
`public/fonts/`-ში და ქმნის `@font-face` წესებს (`src/app/fonts.css`). სანამ ეს საქაღალდე სავსეა,
Google Fonts-ის CDN საერთოდ არ გამოიყენება.

| ფაილი | რა არის |
| --- | --- |
| `GoogleSans[GRAD,wght].woff2` | Google Sans, ცვალებადი წონა 400–700 + GRAD (სისქის) ღერძი −50…200. ლათინური + ქართული (მხედრული და მთავრული) + ₾. ტექსტი, ღილაკები, ქართული სათაურები. |
| `GoogleSans-Italic[GRAD,wght].woff2` | იგივე, დახრილი. |
| `GoogleSansFlex[GRAD,wdth,wght].woff2` | Google Sans Flex, წონა 100–1000, სიგანე 25–151%. მხოლოდ ლათინური. ლათინური სათაურები და ლოგოტიპი „LYON“. |
| `fonts.json` | ფაილების აღწერა @font-face-ისთვის (family, weight, stretch). |
| `OFL-*.txt` | ლიცენზია: SIL Open Font License 1.1 (Google Fonts-ის ოფიციალური გამოშვება, v13.002 / v22). |

ფაილები Google Fonts-ის ოფიციალური ვარიაბელური ფონტებიდანაა დამზადებული (fontTools): ამოჭრილია
მხოლოდ საჭირო სიმბოლოები (ლათინური, ლათინური-ext, ქართული) და დაფიქსირებულია გამოუყენებელი ღერძები,
ამიტომ 4–5 MB-ის ნაცვლად თითო ფაილი 100–220 KB-ია.

## თუ საკუთარი ფაილების ჩადება გინდა

ჩააგდე ttf/otf/woff/woff2 ფაილები ამავე საქაღალდეში. `fonts.json`-ში აღუწერელი ფაილებისთვის
წონა და სტილი სახელიდან გამოიცნობა: `GoogleSans-Bold.ttf`, `GoogleSans-Black.otf`,
`GoogleSansFlex-ExtraBold.ttf`, `GoogleSans-Italic.woff2` … (Thin 100 · Light 300 · Regular 400 ·
Medium 500 · SemiBold 600 · Bold 700 · ExtraBold 800 · Black 900). სახელი `GoogleSansFlex…`-ით
რომ იწყება, „Google Sans Flex“ ოჯახად ჩაითვლება, დანარჩენი — „Google Sans“-ად.
