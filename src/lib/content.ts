import { cache } from "react";
import { prisma } from "./db";
import type { Locale } from "@/i18n/config";

// ------------------------------------------------------------
// საიტის რედაქტირებადი კონტენტი (ჰერო, სექციები, ფუტერი).
// ყოველი სექცია = ველების სია; ლოკალიზებული ველი ინახება {ka, en}-ად.
// სათაურებში *სიტყვა* ვარსკვლავებით -> ნაცრისფერი აქცენტი (ორტონიანი სათაური).
// ------------------------------------------------------------

export type Localized = { ka: string; en: string };
export type FieldType = "text" | "textarea" | "image" | "url";
export type FieldDef = { key: string; label: string; type: FieldType; localized?: boolean; help?: string };
export type SectionDef = { key: string; title: string; description?: string; fields: FieldDef[] };
export type SectionData = Record<string, string | Localized>;

const L = (ka: string, en: string): Localized => ({ ka, en });
const u = (id: string, w = 1600) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const sections: SectionDef[] = [
  {
    key: "hero",
    title: "ჰერო (მთავარი ბანერი)",
    description: "პირველი ეკრანი: დიდი სათაური, ქვესათაური, ღილაკები და ფონის ფოტო.",
    fields: [
      { key: "eyebrow", label: "პატარა წარწერა სათაურის ზემოთ", type: "text", localized: true },
      { key: "title", label: "სათაური", type: "textarea", localized: true, help: "*სიტყვა* ვარსკვლავებში = ნაცრისფერი აქცენტი" },
      { key: "subtitle", label: "ქვესათაური", type: "textarea", localized: true },
      { key: "ctaPrimary", label: "მთავარი ღილაკი — ტექსტი", type: "text", localized: true },
      { key: "ctaPrimaryHref", label: "მთავარი ღილაკი — ბმული", type: "url" },
      { key: "ctaSecondary", label: "მეორე ღილაკი — ტექსტი", type: "text", localized: true },
      { key: "ctaSecondaryHref", label: "მეორე ღილაკი — ბმული", type: "url" },
      { key: "image", label: "ფონის ფოტო", type: "image", help: "სასურველია მუქი, ჰორიზონტალური ფოტო (მინ. 1600px)" },
      { key: "badge1", label: "ბეჯი 1", type: "text", localized: true },
      { key: "badge2", label: "ბეჯი 2", type: "text", localized: true },
      { key: "badge3", label: "ბეჯი 3", type: "text", localized: true },
    ],
  },
  {
    key: "statement",
    title: "მანიფესტი (ტექსტი სურათებით)",
    description: "სამი სტრიქონი, რომელთა შორის პატარა ფოტოები ჩნდება.",
    fields: [
      { key: "line1", label: "სტრიქონი 1", type: "text", localized: true },
      { key: "line2", label: "სტრიქონი 2", type: "text", localized: true },
      { key: "line3", label: "სტრიქონი 3", type: "text", localized: true },
      { key: "chip1", label: "ფოტო 1", type: "image" },
      { key: "chip2", label: "ფოტო 2", type: "image" },
      { key: "chip3", label: "ფოტო 3", type: "image" },
    ],
  },
  {
    key: "editorial1",
    title: "სექცია: კომფორტი (1 დიდი + 2 პატარა ფოტო)",
    fields: [
      { key: "title", label: "სათაური", type: "text", localized: true },
      { key: "subtitle", label: "ქვესათაური", type: "text", localized: true },
      { key: "imageMain", label: "დიდი ფოტო", type: "image" },
      { key: "imageLeft", label: "პატარა ფოტო (მარცხნივ)", type: "image" },
      { key: "imageRight", label: "პატარა ფოტო (მარჯვნივ)", type: "image" },
      { key: "cta", label: "ღილაკი — ტექსტი", type: "text", localized: true },
      { key: "ctaHref", label: "ღილაკი — ბმული", type: "url" },
    ],
  },
  {
    key: "bestSellers",
    title: "სექცია: ბესტსელერები",
    description: "პროდუქტები ავტომატურად ჩნდება — ისინი, რომლებსაც „ბესტსელერი“ აქვს მონიშნული.",
    fields: [
      { key: "title", label: "სათაური", type: "text", localized: true },
      { key: "subtitle", label: "ქვესათაური", type: "text", localized: true },
    ],
  },
  {
    key: "editorial2",
    title: "სექცია: სტილი (ტექსტი + დიდი ფოტო)",
    fields: [
      { key: "title", label: "სათაური", type: "text", localized: true },
      { key: "subtitle", label: "ქვესათაური", type: "textarea", localized: true },
      { key: "image", label: "ფოტო", type: "image" },
      { key: "cta", label: "ღილაკი — ტექსტი", type: "text", localized: true },
      { key: "ctaHref", label: "ღილაკი — ბმული", type: "url" },
    ],
  },
  {
    key: "bento",
    title: "სექცია: ბენტო-გრიდი (5 ფოტო)",
    fields: [
      { key: "title", label: "სათაური", type: "text", localized: true },
      { key: "subtitle", label: "ქვესათაური", type: "text", localized: true },
      { key: "caption", label: "წარწერა შუა ფოტოზე", type: "text", localized: true },
      { key: "text", label: "ტექსტი შუა ფოტოს ქვემოთ", type: "textarea", localized: true },
      { key: "cta", label: "ღილაკი — ტექსტი", type: "text", localized: true },
      { key: "ctaHref", label: "ღილაკი — ბმული", type: "url" },
      { key: "image1", label: "ფოტო 1 (მარცხნივ ზემოთ)", type: "image" },
      { key: "image2", label: "ფოტო 2 (მარცხნივ ქვემოთ)", type: "image" },
      { key: "image3", label: "ფოტო 3 (შუა, დიდი)", type: "image" },
      { key: "image4", label: "ფოტო 4 (მარჯვნივ ზემოთ)", type: "image" },
      { key: "image5", label: "ფოტო 5 (მარჯვნივ ქვემოთ)", type: "image" },
    ],
  },
  {
    key: "newArrivals",
    title: "სექცია: ახალი კოლექცია",
    description: "პროდუქტები ავტომატურად ჩნდება — ისინი, რომლებსაც „ახალი“ აქვს მონიშნული.",
    fields: [
      { key: "title", label: "სათაური", type: "text", localized: true },
      { key: "subtitle", label: "ქვესათაური", type: "text", localized: true },
    ],
  },
  {
    key: "testimonials",
    title: "სექცია: მომხმარებლების შეფასებები",
    fields: [
      { key: "title", label: "სათაური", type: "text", localized: true },
      { key: "subtitle", label: "ქვესათაური", type: "textarea", localized: true },
      { key: "stat", label: "სტატისტიკა (მაგ. +500 კმაყოფილი მომხმარებელი)", type: "text", localized: true },
      { key: "image", label: "დიდი ფოტო", type: "image" },
      { key: "t1Name", label: "შეფასება 1 — სახელი", type: "text" },
      { key: "t1Role", label: "შეფასება 1 — ქვეწარწერა", type: "text", localized: true },
      { key: "t1Text", label: "შეფასება 1 — ტექსტი", type: "textarea", localized: true },
      { key: "t2Name", label: "შეფასება 2 — სახელი", type: "text" },
      { key: "t2Role", label: "შეფასება 2 — ქვეწარწერა", type: "text", localized: true },
      { key: "t2Text", label: "შეფასება 2 — ტექსტი", type: "textarea", localized: true },
      { key: "cta", label: "ღილაკი — ტექსტი", type: "text", localized: true },
      { key: "ctaHref", label: "ღილაკი — ბმული", type: "url" },
    ],
  },
  {
    key: "categories",
    title: "სექცია: კატეგორიები (4 ბარათი)",
    fields: [
      { key: "title", label: "სათაური", type: "text", localized: true },
      { key: "subtitle", label: "ქვესათაური", type: "textarea", localized: true },
      { key: "c1Title", label: "ბარათი 1 — სათაური", type: "text", localized: true },
      { key: "c1Href", label: "ბარათი 1 — ბმული", type: "url" },
      { key: "c1Image", label: "ბარათი 1 — ფოტო", type: "image" },
      { key: "c2Title", label: "ბარათი 2 — სათაური", type: "text", localized: true },
      { key: "c2Href", label: "ბარათი 2 — ბმული", type: "url" },
      { key: "c2Image", label: "ბარათი 2 — ფოტო", type: "image" },
      { key: "c3Title", label: "ბარათი 3 — სათაური", type: "text", localized: true },
      { key: "c3Href", label: "ბარათი 3 — ბმული", type: "url" },
      { key: "c3Image", label: "ბარათი 3 — ფოტო", type: "image" },
      { key: "c4Title", label: "ბარათი 4 — სათაური", type: "text", localized: true },
      { key: "c4Href", label: "ბარათი 4 — ბმული", type: "url" },
      { key: "c4Image", label: "ბარათი 4 — ფოტო", type: "image" },
    ],
  },
  {
    key: "footer",
    title: "ფუტერი",
    fields: [
      { key: "tagline", label: "მოკლე ტექსტი ლოგოს ქვეშ", type: "textarea", localized: true },
      { key: "deliveryNote", label: "მიწოდების ტექსტი", type: "textarea", localized: true },
    ],
  },
];

export const contentDefaults: Record<string, SectionData> = {
  hero: {
    eyebrow: L("ორიგინალი ბრენდული ფეხსაცმელი", "Original branded footwear"),
    title: L("ნაბიჯი, რომელიც *გამოგარჩევს*", "A STEP THAT *SETS YOU APART*"),
    subtitle: L(
      "მხოლოდ ორიგინალი სნიკერსები საუკეთესო ბრენდებისგან — მიწოდება მთელი საქართველოს მასშტაბით.",
      "Only original sneakers from the best brands — delivered anywhere in Georgia."
    ),
    ctaPrimary: L("კატალოგის ნახვა", "Explore the collection"),
    ctaPrimaryHref: "/shop",
    ctaSecondary: L("ახალი კოლექცია", "New arrivals"),
    ctaSecondaryHref: "/shop?new=1",
    image: u("photo-1521093470119-a3acdc43374a", 2000),
    badge1: L("მხოლოდ ორიგინალი", "Only originals"),
    badge2: L("მიწოდება მთელ საქართველოში", "Delivery across Georgia"),
    badge3: L("შეკვეთა ტელეფონით ან WhatsApp-ით", "Order by phone or WhatsApp"),
  },
  statement: {
    line1: L("შედი ქალაქში კოლექციით,", "Step into the city in a collection"),
    line2: L("რომელიც თამამ სტილს", "that pairs bold street style"),
    line3: L("ყოველდღიურ კომფორტს უხამებს", "with everyday comfort"),
    chip1: u("photo-1460353581641-37baddab0fa2", 600),
    chip2: u("photo-1542219550-37153d387c27", 600),
    chip3: u("photo-1595341888016-a392ef81b7de", 600),
  },
  editorial1: {
    title: L("კომფორტი *ყოველ* ნაბიჯში", "COMFORT IN *EVERY* STEP"),
    subtitle: L("თანამედროვე ტექნოლოგიები და ხარისხი, რომელსაც ფეხით იგრძნობ.", "Modern technology and quality you can feel with every stride."),
    imageMain: u("photo-1514989940723-e8e51635b782", 1600),
    imageLeft: u("photo-1515955656352-a1fa3ffcd111", 1000),
    imageRight: u("photo-1520256862855-398228c41684", 1000),
    cta: L("ნახე კოლექცია", "Shop now"),
    ctaHref: "/shop",
  },
  bestSellers: {
    title: L("*ბესტ*სელერები", "BEST *SELLERS*"),
    subtitle: L("მოდელები, რომლებსაც ყველაზე ხშირად ირჩევენ.", "The pairs our customers choose most."),
  },
  editorial2: {
    title: L("შენი სტილი, *შენი* წესები", "YOUR STYLE, *YOUR* RULES"),
    subtitle: L(
      "სტრიტვეარიდან სპორტამდე — ყოველი მოდელი შერჩეულია, რომ დღის ნებისმიერ მომენტში თავდაჯერებულად იარო.",
      "From streetwear to sport — every pair is picked so you walk with confidence at any moment of the day."
    ),
    image: u("photo-1529139574466-a303027c1d8b", 1400),
    cta: L("ნახე კოლექცია", "Shop now"),
    ctaHref: "/shop?category=women",
  },
  bento: {
    title: L("სრული *ძალით*", "FULL *FORCE* STYLE"),
    subtitle: L("ორიგინალი მოდელები, რომლებიც ქუჩას ასხვაფერებენ.", "Original pairs that change how the street looks."),
    caption: L("სრული ძალით", "FULL FORCE STYLE"),
    text: L(
      "შექმნილია მათთვის, ვინც მიზნით მოძრაობს — ხარისხი, კომფორტი და დიზაინი ერთ წყვილში.",
      "Made for those who move with purpose — quality, comfort and design in one pair."
    ),
    cta: L("ნახე კოლექცია", "Shop now"),
    ctaHref: "/shop",
    image1: u("photo-1483985988355-763728e1935b", 900),
    image2: u("photo-1584735175315-9d5df23860e6", 900),
    image3: u("photo-1560769629-975ec94e6a86", 1400),
    image4: u("photo-1603808033192-082d6919d3e1", 900),
    image5: u("photo-1503342217505-b0a15ec3261c", 900),
  },
  newArrivals: {
    title: L("*ახალი* კოლექცია", "NEW *ARRIVALS*"),
    subtitle: L("ახალი მოდელები ყოველ კვირას.", "Fresh pairs every week."),
  },
  testimonials: {
    title: L("რას ამბობენ *მომხმარებლები*", "WHAT OUR *CUSTOMERS* SAY"),
    subtitle: L(
      "ასობით მომხმარებელი გვენდობა ორიგინალობის, ხარისხისა და სწრაფი მიწოდების გამო.",
      "Hundreds of customers trust us for originals, quality and fast delivery."
    ),
    stat: L("+500 კმაყოფილი მომხმარებელი", "+500 happy customers"),
    image: u("photo-1509631179647-0177331693ae", 1200),
    t1Name: "ნინო კ.",
    t1Role: L("თბილისი", "Tbilisi"),
    t1Text: L(
      "ბევრ მაღაზიაში მიყიდია, მაგრამ აქ ორიგინალობაში ეჭვი არასდროს შემპარვია. მიწოდებაც სწრაფი იყო — მეორე დღეს მქონდა.",
      "I've bought from many stores, but here I never doubted the originality. Delivery was fast too — I had it the next day."
    ),
    t2Name: "გიორგი მ.",
    t2Role: L("ბათუმი", "Batumi"),
    t2Text: L(
      "WhatsApp-ზე მივწერე, ზომაში დამეხმარნენ და ბათუმში ორ დღეში ჩამომივიდა. ძალიან კომფორტული წყვილია.",
      "I messaged on WhatsApp, they helped me with sizing and it arrived in Batumi in two days. Super comfortable pair."
    ),
    cta: L("ნახე კოლექცია", "Explore all"),
    ctaHref: "/shop",
  },
  categories: {
    title: L("ყველა *თამაშისთვის*", "BUILT FOR *EVERY* GAME"),
    subtitle: L(
      "სირბილიდან ქუჩის სტილამდე — შეარჩიე მოდელი შენი რიტმისთვის.",
      "From running to street style — pick the pair for your rhythm."
    ),
    c1Title: L("სარბენი", "Running"),
    c1Href: "/shop?type=running",
    c1Image: u("photo-1511556532299-8f662fc26c06", 900),
    c2Title: L("საკალათბურთო", "Basketball"),
    c2Href: "/shop?type=basketball",
    c2Image: u("photo-1605348532760-6753d2c43329", 900),
    c3Title: L("ვარჯიშისთვის", "Training"),
    c3Href: "/shop?type=sneakers",
    c3Image: u("photo-1584464491033-06628f3a6b7b", 900),
    c4Title: L("ქუჩის სტილი", "Street style"),
    c4Href: "/shop?category=men",
    c4Image: u("photo-1556906781-9a412961c28c", 900),
  },
  footer: {
    tagline: L(
      "მხოლოდ ორიგინალი ბრენდული ფეხსაცმელი. მიწოდება მთელი საქართველოს მასშტაბით.",
      "Only original branded footwear. Delivery across Georgia."
    ),
    deliveryNote: L("მიწოდება მთელ საქართველოში 1–3 სამუშაო დღეში.", "Delivery across Georgia within 1–3 business days."),
  },
};

export function pick(value: string | Localized | undefined | null, lang: Locale): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] || value.ka || value.en || "";
}

function mergeSection(key: string, stored: SectionData | null): SectionData {
  const defaults = contentDefaults[key] ?? {};
  if (!stored) return { ...defaults };
  const out: SectionData = { ...defaults };
  for (const [k, v] of Object.entries(stored)) {
    const d = defaults[k];
    if (typeof d === "object" && d !== null && typeof v === "object" && v !== null) {
      out[k] = { ka: v.ka ?? d.ka, en: v.en ?? d.en };
    } else if (v !== undefined && v !== null) {
      out[k] = v;
    }
  }
  return out;
}

export const getAllContent = cache(async (): Promise<Record<string, SectionData>> => {
  const rows = await prisma.siteContent.findMany();
  const stored = new Map<string, SectionData>();
  for (const row of rows) {
    try {
      stored.set(row.key, JSON.parse(row.data) as SectionData);
    } catch {
      // დაზიანებული ჩანაწერი — ნაგულისხმევი გამოიყენება
    }
  }
  const out: Record<string, SectionData> = {};
  for (const key of Object.keys(contentDefaults)) out[key] = mergeSection(key, stored.get(key) ?? null);
  return out;
});

export async function getContent(key: string): Promise<SectionData> {
  const all = await getAllContent();
  return all[key] ?? { ...(contentDefaults[key] ?? {}) };
}

export async function saveContent(key: string, data: SectionData): Promise<void> {
  const json = JSON.stringify(data);
  await prisma.siteContent.upsert({ where: { key }, update: { data: json }, create: { key, data: json } });
}
