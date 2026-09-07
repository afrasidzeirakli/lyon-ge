import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import { InstagramIcon, FacebookIcon, TikTokIcon } from "./SocialIcons";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { StoreSettings } from "@/lib/settings";
import { telLink, whatsappLink } from "@/lib/settings";
import { pick, type SectionData } from "@/lib/content";
import { WhatsAppIcon } from "./WhatsAppFab";

type Props = { lang: Locale; dict: Dictionary; settings: StoreSettings; content: SectionData };

export function Footer({ lang, dict, settings, content }: Props) {
  const t = dict.footer;
  const year = new Date().getFullYear();
  const shopLinks = [
    { label: dict.nav.shop, href: "/shop" },
    { label: dict.nav.new, href: "/shop?new=1" },
    { label: dict.nav.men, href: "/shop?category=men" },
    { label: dict.nav.women, href: "/shop?category=women" },
    { label: dict.nav.kids, href: "/shop?category=kids" },
    { label: dict.nav.sale, href: "/shop?sale=1" },
  ];
  const socials = [
    settings.instagram ? { label: "Instagram", href: settings.instagram, icon: InstagramIcon } : null,
    settings.facebook ? { label: "Facebook", href: settings.facebook, icon: FacebookIcon } : null,
    settings.tiktok ? { label: "TikTok", href: settings.tiktok, icon: TikTokIcon } : null,
  ].filter(Boolean) as { label: string; href: string; icon: typeof InstagramIcon }[];

  return (
    <footer className="mt-24 bg-ink text-cream" id="contact">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="wordmark text-3xl text-white">{settings.storeName || "LYON"}</p>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/60">{pick(content.tagline, lang)}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="badge border border-white/15 text-white/80">{dict.badges.original}</span>
            <span className="badge border border-white/15 text-white/80">{dict.badges.delivery}</span>
          </div>
        </div>

        <div>
          <h3 className="text-[12px] font-semibold tracking-[0.18em] text-white/50 uppercase">{t.shop}</h3>
          <ul className="mt-4 space-y-2.5">
            {shopLinks.map((l) => (
              <li key={l.href}>
                <Link href={localePath(lang, l.href)} className="text-[15px] text-white/85 transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-[12px] font-semibold tracking-[0.18em] text-white/50 uppercase">{t.contact}</h3>
          <ul className="mt-4 space-y-3 text-[15px] text-white/85">
            {settings.phone ? (
              <li>
                <a href={telLink(settings.phone)} className="inline-flex items-center gap-2.5 transition hover:text-white">
                  <Phone className="h-4 w-4 text-white/50" /> {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.whatsapp ? (
              <li>
                <a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 transition hover:text-white">
                  <WhatsAppIcon className="h-4 w-4 text-white/50" /> {t.writeUs}
                </a>
              </li>
            ) : null}
            {(lang === "en" ? settings.addressEn : settings.addressKa) ? (
              <li className="inline-flex items-start gap-2.5">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-white/50" /> {lang === "en" ? settings.addressEn : settings.addressKa}
              </li>
            ) : null}
            {(lang === "en" ? settings.workingHoursEn : settings.workingHoursKa) ? (
              <li className="inline-flex items-start gap-2.5">
                <Clock className="mt-1 h-4 w-4 shrink-0 text-white/50" /> {lang === "en" ? settings.workingHoursEn : settings.workingHoursKa}
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h3 className="text-[12px] font-semibold tracking-[0.18em] text-white/50 uppercase">{t.help}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-white/85">{pick(content.deliveryNote, lang)}</p>
          {socials.length > 0 ? (
            <>
              <h3 className="mt-8 text-[12px] font-semibold tracking-[0.18em] text-white/50 uppercase">{t.follow}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[13px] text-white/85 transition hover:bg-white hover:text-ink"
                    >
                      {s.icon ? <s.icon className="h-4 w-4" /> : null}
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>

      <div className="container-x flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-[13px] text-white/50 sm:flex-row">
        <span>
          © {year} {settings.storeName || "LYON"} — {t.rights}
        </span>
        <span>{dict.badges.original}</span>
      </div>
    </footer>
  );
}
