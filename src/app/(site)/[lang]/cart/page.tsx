import type { Metadata } from "next";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveLang } from "@/lib/site";
import { CartPage } from "@/components/site/cart/CartPage";
import { Headline } from "@/components/site/Headline";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).cart.title, robots: { index: false } };
}

export default async function Page({ params }: Props) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  return (
    <div className="container-x pt-8 pb-16 lg:pt-12">
      <Headline as="h1" text={dict.cart.title} className="text-4xl sm:text-5xl" />
      <div className="mt-8 lg:mt-12">
        <CartPage lang={lang} dict={dict} />
      </div>
    </div>
  );
}
