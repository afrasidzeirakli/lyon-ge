/* eslint-disable no-console */
// საწყისი მონაცემები: ადმინი, კატეგორიები, ბრენდები, სადემონსტრაციო პროდუქტები,
// პრომო კოდი, კონტენტი და პარამეტრები. გაშვება: npm run db:seed
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import { contentDefaults } from "../src/lib/content";
import { defaultSettings } from "../src/lib/settings";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const u = (id: string, w = 1400) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

// დეტერმინისტული "შემთხვევითი" მარაგი, რომ seed ყოველთვის ერთნაირი იყოს
let seedState = 42;
function rnd(max: number): number {
  seedState = (seedState * 1103515245 + 12345) % 2147483648;
  return seedState % (max + 1);
}

const SIZES: Record<string, string[]> = {
  men: ["40", "41", "42", "43", "44", "45", "46"],
  women: ["36", "37", "38", "39", "40", "41"],
  kids: ["30", "31", "32", "33", "34", "35", "36"],
};

type SeedColor = [string, string, string]; // ka, en, hex
type SeedProduct = {
  slug: string;
  nameKa: string;
  nameEn: string;
  brand: string;
  category: "men" | "women" | "kids";
  type: string;
  price: number; // ლარებში
  salePrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  images: string[];
  colors: SeedColor[];
  descKa: string;
  descEn: string;
};

const WHITE: SeedColor = ["თეთრი", "White", "#F3F1EC"];
const BLACK: SeedColor = ["შავი", "Black", "#111111"];
const RED: SeedColor = ["წითელი", "Red", "#C8102E"];
const GREY: SeedColor = ["ნაცრისფერი", "Grey", "#9A9A9A"];
const BLUE: SeedColor = ["ლურჯი", "Blue", "#2F55D4"];

const products: SeedProduct[] = [
  {
    slug: "nike-free-rn-flyknit-red", nameKa: "Nike Free RN Flyknit", nameEn: "Nike Free RN Flyknit", brand: "Nike", category: "men", type: "running",
    price: 259, isBestSeller: true, images: [u("photo-1542291026-7eec264c27ff")], colors: [RED, BLACK],
    descKa: "მსუბუქი სარბენი მოდელი Flyknit ზედაპირით, რომელიც ფეხს წინდასავით ერგება. მოქნილი ძირი ბუნებრივი მოძრაობისთვის.",
    descEn: "A lightweight runner with a Flyknit upper that hugs the foot like a sock. Flexible sole for natural movement.",
  },
  {
    slug: "nike-air-force-1-shadow-pastel", nameKa: "Nike Air Force 1 Shadow", nameEn: "Nike Air Force 1 Shadow", brand: "Nike", category: "women", type: "sneakers",
    price: 349, isNew: true, isFeatured: true, images: [u("photo-1595950653106-6c9ebd614d3a")], colors: [["პასტელი", "Pastel", "#E9D5E6"], WHITE],
    descKa: "AF1-ის ორმაგი დეტალები და პასტელური ფერები — კლასიკა ახალი ხედვით. მაღალი პლატფორმა და რბილი ბალიში.",
    descEn: "Doubled AF1 details in pastel tones — a classic with a fresh twist. Elevated platform and cushioned step.",
  },
  {
    slug: "nike-air-max-1-white-orange", nameKa: "Nike Air Max 1", nameEn: "Nike Air Max 1", brand: "Nike", category: "men", type: "sneakers",
    price: 389, salePrice: 329, isBestSeller: true, images: [u("photo-1600185365926-3a2ce3cdb9eb")], colors: [WHITE, ["ნარინჯისფერი", "Orange", "#F26A1B"]],
    descKa: "ლეგენდარული Air Max 1 ხილული Air ბალიშით. ტყავისა და ქსოვილის კომბინაცია ყოველდღიური კომფორტისთვის.",
    descEn: "The legendary Air Max 1 with visible Air cushioning. Leather and textile mix for everyday comfort.",
  },
  {
    slug: "air-jordan-1-mid-chicago", nameKa: "Air Jordan 1 Mid Chicago", nameEn: "Air Jordan 1 Mid Chicago", brand: "Jordan", category: "men", type: "basketball",
    price: 449, isBestSeller: true, isFeatured: true, images: [u("photo-1552346154-21d32810aba3"), u("photo-1521093470119-a3acdc43374a")], colors: [RED, BLACK, WHITE],
    descKa: "ისტორიული Chicago ფერები Mid სილუეტში. ნამდვილი ტყავი, Air-Sole ბალიში და უდროო დიზაინი.",
    descEn: "Historic Chicago colors on the Mid silhouette. Real leather, Air-Sole cushioning and timeless design.",
  },
  {
    slug: "vans-old-skool-burgundy", nameKa: "Vans Old Skool", nameEn: "Vans Old Skool", brand: "Vans", category: "women", type: "sneakers",
    price: 219, images: [u("photo-1525966222134-fcfa99b8ae77")], colors: [["ბორდო", "Burgundy", "#6B1F2B"], BLACK],
    descKa: "სკეიტ-კულტურის კლასიკა Sidestripe-ით. ზამშისა და ტილოს ზედაპირი, ვაფლისებრი ძირი.",
    descEn: "The skate classic with the Sidestripe. Suede and canvas upper, waffle outsole.",
  },
  {
    slug: "nike-air-max-tavas-grey", nameKa: "Nike Air Max Tavas", nameEn: "Nike Air Max Tavas", brand: "Nike", category: "men", type: "running",
    price: 299, images: [u("photo-1460353581641-37baddab0fa2")], colors: [GREY, WHITE],
    descKa: "მინიმალისტური Air Max ქსოვილის ზედაპირით და მსუბუქი Air ბალიშით — შესანიშნავი ყოველდღიური წყვილი.",
    descEn: "A minimalist Air Max with a textile upper and light Air cushioning — a great everyday pair.",
  },
  {
    slug: "nike-air-force-1-high-wheat", nameKa: "Nike Air Force 1 High Wheat", nameEn: "Nike Air Force 1 High Wheat", brand: "Nike", category: "men", type: "boots",
    price: 379, images: [u("photo-1549298916-b41d501d3772")], colors: [["ხორბლისფერი", "Wheat", "#C48A3F"]],
    descKa: "მაღალი AF1 Wheat ფერის ნუბუკით — შემოდგომა-ზამთრის იდეალური არჩევანი.",
    descEn: "The high-top AF1 in Wheat nubuck — the ideal pick for autumn and winter.",
  },
  {
    slug: "nike-air-zoom-pegasus-volt", nameKa: "Nike Air Zoom Pegasus", nameEn: "Nike Air Zoom Pegasus", brand: "Nike", category: "men", type: "running",
    price: 329, isNew: true, images: [u("photo-1606107557195-0e29a4b5b4aa")], colors: [["ვოლტი", "Volt", "#C6F53B"], BLACK],
    descKa: "სარბენი კლასიკა Zoom Air ბალიშით. რეაქტიული, მსუბუქი და გამძლე — ყოველდღიური სირბილისთვის.",
    descEn: "The running classic with Zoom Air. Responsive, light and durable — built for daily miles.",
  },
  {
    slug: "puma-smash-white", nameKa: "Puma Smash", nameEn: "Puma Smash", brand: "Puma", category: "women", type: "sneakers",
    price: 179, images: [u("photo-1608231387042-66d1773070a5")], colors: [WHITE],
    descKa: "სუფთა თეთრი ტყავის სნიკერსი ტენისის სტილში — მარტივი, მსუბუქი, უნივერსალური.",
    descEn: "Clean white leather tennis-style sneaker — simple, light, versatile.",
  },
  {
    slug: "air-jordan-1-low-white-red", nameKa: "Air Jordan 1 Low", nameEn: "Air Jordan 1 Low", brand: "Jordan", category: "men", type: "sneakers",
    price: 399, isBestSeller: true, images: [u("photo-1597045566677-8cf032ed6634")], colors: [WHITE, RED, BLACK],
    descKa: "დაბალი AJ1 კლასიკური ფერებით. ტყავის ზედაპირი, Air-Sole ბალიში, ყოველდღიური სტილი.",
    descEn: "The low-cut AJ1 in classic colors. Leather upper, Air-Sole cushioning, everyday style.",
  },
  {
    slug: "nike-sb-dunk-high", nameKa: "Nike SB Dunk High", nameEn: "Nike SB Dunk High", brand: "Nike", category: "men", type: "sneakers",
    price: 419, isNew: true, images: [u("photo-1584735175315-9d5df23860e6")], colors: [["კრემისფერი", "Cream", "#EAD9C5"], ["ვარდისფერი", "Pink", "#E7A9A0"]],
    descKa: "სკეიტისთვის შექმნილი, ქუჩისთვის შეყვარებული. რბილი ენა, Zoom Air ქუსლში და პრემიუმ ზამში.",
    descEn: "Built for skating, loved on the street. Padded tongue, Zoom Air heel and premium suede.",
  },
  {
    slug: "new-balance-574-olive", nameKa: "New Balance 574", nameEn: "New Balance 574", brand: "New Balance", category: "men", type: "sneakers",
    price: 289, images: [u("photo-1539185441755-769473a23570")], colors: [["ზეთისხილისფერი", "Olive", "#5B6B3C"], GREY],
    descKa: "574 — ყველაზე ცნობადი NB სილუეტი. ENCAP ბალიში და ზამშის/ქსოვილის ზედაპირი.",
    descEn: "The 574 — New Balance's most recognizable silhouette. ENCAP cushioning with suede and mesh upper.",
  },
  {
    slug: "nike-air-force-1-high-white", nameKa: "Nike Air Force 1 High", nameEn: "Nike Air Force 1 High", brand: "Nike", category: "women", type: "sneakers",
    price: 359, images: [u("photo-1512374382149-233c42b6a83b")], colors: [WHITE],
    descKa: "სუფთა თეთრი მაღალი AF1 ველკროს სამაგრით — 1982 წლიდან უცვლელი კლასიკა.",
    descEn: "The all-white high-top AF1 with its signature strap — unchanged classic since 1982.",
  },
  {
    slug: "nike-air-force-1-low-black", nameKa: "Nike Air Force 1 Low", nameEn: "Nike Air Force 1 Low", brand: "Nike", category: "men", type: "sneakers",
    price: 349, isBestSeller: true, images: [u("photo-1543508282-6319a3e2621f")], colors: [BLACK, WHITE],
    descKa: "შავი AF1 Low — ყველაზე უნივერსალური სნიკერსი შენს კარადაში. ტყავი, Air ბალიში, გამძლე ძირი.",
    descEn: "The black AF1 Low — the most versatile sneaker in your closet. Leather, Air cushioning, durable sole.",
  },
  {
    slug: "nike-air-force-1-react", nameKa: "Nike Air Force 1 React", nameEn: "Nike Air Force 1 React", brand: "Nike", category: "men", type: "sneakers",
    price: 379, isNew: true, images: [u("photo-1579338559194-a162d19bf842")], colors: [WHITE, BLUE, RED],
    descKa: "AF1 React ტექნოლოგიით — უფრო რბილი, უფრო მსუბუქი და უფრო რეაქტიული ვიდრე ოდესმე.",
    descEn: "AF1 with React foam — softer, lighter and more responsive than ever.",
  },
  {
    slug: "nike-kyrie-7-kids", nameKa: "Nike Kyrie 7 (ბავშვი)", nameEn: "Nike Kyrie 7 (Kids)", brand: "Nike", category: "kids", type: "basketball",
    price: 249, isNew: true, images: [u("photo-1605348532760-6753d2c43329")], colors: [BLACK, WHITE],
    descKa: "საბავშვო საკალათბურთო მოდელი მოქნილი ძირით და მყარი ფიქსაციით სწრაფი მოძრაობებისთვის.",
    descEn: "Kids' basketball shoe with a flexible sole and secure lockdown for quick movements.",
  },
  {
    slug: "puma-rs-x-pink", nameKa: "Puma RS-X", nameEn: "Puma RS-X", brand: "Puma", category: "women", type: "sneakers",
    price: 299, salePrice: 239, isFeatured: true, images: [u("photo-1608667508764-33cf0726b13a")], colors: [["ვარდისფერი", "Pink", "#F2B5A7"], WHITE],
    descKa: "მასიური სილუეტი, რეტრო ფერები და RS ბალიში — 80-იანების ენერგია დღევანდელ ქუჩაში.",
    descEn: "Chunky silhouette, retro colors and RS cushioning — 80s energy on today's streets.",
  },
  {
    slug: "adidas-deerupt-grey", nameKa: "adidas Deerupt Runner", nameEn: "adidas Deerupt Runner", brand: "adidas", category: "women", type: "running",
    price: 269, images: [u("photo-1562183241-b937e95585b6")], colors: [GREY, BLACK],
    descKa: "ბადისებრი ზედაპირი, რომელიც ფეხს ერგება, და მსუბუქი ძირი. ქალაქური სირბილისთვის.",
    descEn: "A grid-like upper that wraps the foot with a lightweight sole. Made for city runs.",
  },
  {
    slug: "adidas-prophere", nameKa: "adidas Prophere", nameEn: "adidas Prophere", brand: "adidas", category: "men", type: "sneakers",
    price: 309, images: [u("photo-1520256862855-398228c41684")], colors: [BLUE, ["ვარდისფერი", "Pink", "#F2B5A7"]],
    descKa: "თამამი, ფუტურისტული სილუეტი Primeknit ზედაპირით და მასიური ძირით.",
    descEn: "A bold, futuristic silhouette with a Primeknit upper and a chunky outsole.",
  },
  {
    slug: "k-swiss-kids-white-blue", nameKa: "K-Swiss (ბავშვი)", nameEn: "K-Swiss (Kids)", brand: "K-Swiss", category: "kids", type: "sneakers",
    price: 199, images: [u("photo-1595341888016-a392ef81b7de")], colors: [WHITE, BLUE, ["ნარინჯისფერი", "Orange", "#F26A1B"]],
    descKa: "მსუბუქი საბავშვო სნიკერსი მკვეთრი აქცენტებით — სკოლისთვის და ეზოსთვის.",
    descEn: "A lightweight kids' sneaker with bright accents — for school and the playground.",
  },
  {
    slug: "air-jordan-1-high-white-yellow", nameKa: "Air Jordan 1 High", nameEn: "Air Jordan 1 High", brand: "Jordan", category: "men", type: "basketball",
    price: 499, isNew: true, isFeatured: true, images: [u("photo-1542219550-37153d387c27")], colors: [WHITE, ["ყვითელი", "Yellow", "#E8B830"], GREY],
    descKa: "AJ1 High ორიგინალური პროპორციებით და პრემიუმ ტყავით — კოლექციის მთავარი წყვილი.",
    descEn: "The AJ1 High in original proportions and premium leather — the centerpiece of any collection.",
  },
  {
    slug: "nike-air-max-90-pink", nameKa: "Nike Air Max 90", nameEn: "Nike Air Max 90", brand: "Nike", category: "women", type: "running",
    price: 359, isBestSeller: true, images: [u("photo-1511556532299-8f662fc26c06")], colors: [["ვარდისფერი", "Pink", "#E8489A"], WHITE, GREY],
    descKa: "ხილული Air ბალიში, დახრილი ძირი და 90-იანების ფერები — ყოველთვის აქტუალური.",
    descEn: "Visible Air cushioning, the wavy sole and 90s colors — always in style.",
  },
  {
    slug: "nike-air-max-90-orange", nameKa: "Nike Air Max 90 Orange", nameEn: "Nike Air Max 90 Orange", brand: "Nike", category: "men", type: "running",
    price: 359, images: [u("photo-1514989940723-e8e51635b782")], colors: [["ნარინჯისფერი", "Orange", "#F26A1B"], BLUE, WHITE],
    descKa: "Air Max 90 თამამ ნარინჯისფერ-ლურჯ კომბინაციაში. ტყავი და ქსოვილი, გამძლე ვაფლის ძირი.",
    descEn: "The Air Max 90 in a bold orange and blue mix. Leather and mesh, durable waffle outsole.",
  },
];

async function main() {
  console.log("→ ადმინი");
  const username = process.env.ADMIN_USERNAME || "admin";
  // პაროლი .env-დან; თუ არ არის, შემთხვევითი გენერირდება და ერთხელ იბეჭდება
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || randomBytes(9).toString("base64url");
  const existingAdmin = await prisma.admin.findUnique({ where: { username } });
  if (!existingAdmin) {
    await prisma.admin.create({ data: { username, passwordHash: hashPassword(password) } });
    console.log(`  შეიქმნა ადმინი: ${username} / ${password}${generated ? "   <- ჩაიწერე! (.env-ში ADMIN_PASSWORD არ იყო)" : ""}`);
  } else {
    console.log("  ადმინი უკვე არსებობს — პაროლი უცვლელია");
  }

  console.log("→ კატეგორიები");
  const categoryDefs = [
    { slug: "men", nameKa: "მამაკაცი", nameEn: "Men", sortOrder: 1, imageUrl: u("photo-1556906781-9a412961c28c", 900) },
    { slug: "women", nameKa: "ქალი", nameEn: "Women", sortOrder: 2, imageUrl: u("photo-1503342217505-b0a15ec3261c", 900) },
    { slug: "kids", nameKa: "ბავშვი", nameEn: "Kids", sortOrder: 3, imageUrl: u("photo-1595341888016-a392ef81b7de", 900) },
  ];
  const categories = new Map<string, number>();
  for (const c of categoryDefs) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    categories.set(c.slug, row.id);
  }

  console.log("→ ბრენდები");
  const brandNames = ["Nike", "Jordan", "adidas", "New Balance", "Puma", "Vans", "K-Swiss"];
  const brands = new Map<string, number>();
  for (const name of brandNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const row = await prisma.brand.upsert({ where: { slug }, update: {}, create: { slug, name } });
    brands.set(name, row.id);
  }

  console.log("→ პროდუქტები");
  let sort = 0;
  for (const p of products) {
    sort += 1;
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    const sizes = SIZES[p.category];
    await prisma.product.create({
      data: {
        slug: p.slug,
        nameKa: p.nameKa,
        nameEn: p.nameEn,
        descriptionKa: p.descKa,
        descriptionEn: p.descEn,
        brandId: brands.get(p.brand) ?? null,
        categoryId: categories.get(p.category) ?? null,
        productType: p.type,
        price: p.price * 100,
        salePrice: p.salePrice ? p.salePrice * 100 : null,
        isNew: !!p.isNew,
        isBestSeller: !!p.isBestSeller,
        isFeatured: !!p.isFeatured,
        isActive: true,
        sortOrder: sort,
        images: { create: p.images.map((url, i) => ({ url, alt: p.nameEn, sortOrder: i })) },
        colors: { create: p.colors.map(([nameKa, nameEn, hex], i) => ({ nameKa, nameEn, hex, sortOrder: i })) },
        sizes: { create: sizes.map((size, i) => ({ size, stock: rnd(6), sortOrder: i })) },
      },
    });
  }
  console.log(`  ${products.length} პროდუქტი`);

  console.log("→ პრომო კოდი და აქცია");
  await prisma.promoCode.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", type: "percent", value: 10, minSubtotal: 10000, isActive: true },
  });
  if ((await prisma.promotion.count()) === 0) {
    await prisma.promotion.create({
      data: {
        titleKa: "სარბენი მოდელები -15%",
        titleEn: "Running shoes -15%",
        percent: 15,
        scope: "type",
        productType: "running",
        isActive: false,
      },
    });
  }

  console.log("→ კონტენტი");
  for (const [key, data] of Object.entries(contentDefaults)) {
    const json = JSON.stringify(data);
    await prisma.siteContent.upsert({ where: { key }, update: {}, create: { key, data: json } });
  }

  console.log("→ პარამეტრები");
  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value: String(value) } });
  }

  console.log("✓ მზადაა");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
