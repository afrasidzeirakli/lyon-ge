import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import assets from "@/generated/assets.json";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getSettings } from "@/lib/settings";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { CartProvider } from "@/components/site/cart/CartProvider";
import { CartDrawer } from "@/components/site/cart/CartDrawer";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";

// კატალოგი და კონტენტი ბაზიდან იკითხება ყოველ რექვესთზე
export const dynamic = "force-dynamic";

// ფონტები: ნაგულისხმევად ლოკალური ფაილებიდან (fonts/ -> public/fonts, იხ. scripts/sync-assets.mjs).
// რაც ლოკალურად არ არის, Google Fonts-იდან იტვირთება (Google Sans ქართული სუბსეტით + GRAD ღერძით).
const GOOGLE_FONTS_FAMILIES = [
  ...(assets.localGoogleSans ? [] : ["family=Google+Sans:GRAD,wght@-50..200,400..700"]),
  ...(assets.localGoogleSansFlex ? [] : ["family=Google+Sans+Flex:GRAD,wdth,wght@0..100,25..151,100..1000"]),
];
const FONTS_HREF = GOOGLE_FONTS_FAMILIES.length > 0 ? `https://fonts.googleapis.com/css2?${GOOGLE_FONTS_FAMILIES.join("&")}&display=swap` : null;

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = getDictionary(lang);
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: dict.meta.title, template: `%s — ${settings.storeName || "LYON"}` },
    description: dict.meta.description,
    alternates: { languages: { ka: "/", en: "/en" } },
    openGraph: { siteName: settings.storeName || "LYON", locale: lang === "ka" ? "ka_GE" : "en_US", type: "website" },
  };
}

export default async function SiteLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const [settings, footerContent] = await Promise.all([getSettings(), getContent("footer")]);
  const logoAssets = {
    name: settings.storeName || "LYON",
    logoUrl: settings.logoUrl || assets.logo || null,
    logoWhiteUrl: settings.logoWhiteUrl || assets.logoWhite || null,
  };

  return (
    <html lang={lang} className="h-full">
      <head>
        {FONTS_HREF ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={FONTS_HREF} />
          </>
        ) : null}
      </head>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <Header lang={lang} dict={dict} assets={logoAssets} phone={settings.phone} />
          <main className="flex-1">{children}</main>
          <Footer lang={lang} dict={dict} settings={settings} content={footerContent} />
          <CartDrawer lang={lang} dict={dict} />
          <WhatsAppFab number={settings.whatsapp} label={dict.footer.writeUs} />
        </CartProvider>
      </body>
    </html>
  );
}
