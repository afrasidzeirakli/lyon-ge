import type { Metadata } from "next";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveLang } from "@/lib/site";
import { getSettings } from "@/lib/settings";
import { CheckoutForm } from "@/components/site/checkout/CheckoutForm";
import { Headline } from "@/components/site/Headline";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).checkout.title, robots: { index: false } };
}

export default async function CheckoutPage({ params }: Props) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const settings = await getSettings();
  return (
    <div className="container-x pt-8 pb-16 lg:pt-12">
      <Headline as="h1" text={dict.checkout.title} className="text-4xl sm:text-5xl" />
      <div className="mt-8 lg:mt-12">
        <CheckoutForm lang={lang} dict={dict} shippingFee={settings.shippingFee} freeShippingFrom={settings.freeShippingFrom} />
      </div>
    </div>
  );
}
