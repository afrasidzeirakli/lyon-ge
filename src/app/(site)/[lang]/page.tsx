import { getDictionary } from "@/i18n/dictionaries";
import { resolveLang } from "@/lib/site";
import { getAllContent, pick } from "@/lib/content";
import { getHomeProducts, getTaxonomies } from "@/lib/catalog";
import { Hero } from "@/components/site/home/Hero";
import { Statement } from "@/components/site/home/Statement";
import { EditorialSplit, EditorialTriptych } from "@/components/site/home/Editorial";
import { ProductsSection } from "@/components/site/home/ProductsSection";
import { Bento } from "@/components/site/home/Bento";
import { Testimonials } from "@/components/site/home/Testimonials";
import { Categories } from "@/components/site/home/Categories";
import { BrandStrip } from "@/components/site/home/BrandStrip";

type Props = { params: Promise<{ lang: string }> };

export default async function HomePage({ params }: Props) {
  const lang = await resolveLang(params);
  const dict = getDictionary(lang);
  const [content, { bestSellers, newArrivals }, { brands }] = await Promise.all([getAllContent(), getHomeProducts(), getTaxonomies()]);

  return (
    <>
      <Hero content={content.hero} lang={lang} />
      <Statement content={content.statement} lang={lang} />
      <EditorialTriptych content={content.editorial1} lang={lang} />
      <ProductsSection
        title={pick(content.bestSellers.title, lang)}
        subtitle={pick(content.bestSellers.subtitle, lang)}
        products={bestSellers}
        lang={lang}
        dict={dict}
        viewAllHref="/shop?sort=popular"
      />
      <EditorialSplit content={content.editorial2} lang={lang} />
      <Bento content={content.bento} lang={lang} />
      <ProductsSection
        title={pick(content.newArrivals.title, lang)}
        subtitle={pick(content.newArrivals.subtitle, lang)}
        products={newArrivals}
        lang={lang}
        dict={dict}
        viewAllHref="/shop?new=1"
      />
      <BrandStrip brands={brands} lang={lang} label={dict.common.brands} />
      <Testimonials content={content.testimonials} lang={lang} />
      <Categories content={content.categories} lang={lang} />
    </>
  );
}
