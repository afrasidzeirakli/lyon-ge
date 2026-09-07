import { KeyRound, Save, Send } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { gelInput } from "@/lib/money";
import { saveStoreSettings, testTelegram, changePassword } from "@/lib/admin/actions/settings";
import { Card, Field, PageHeader } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { Notice } from "@/components/admin/Notice";
import assets from "@/generated/assets.json";

export const metadata = { title: "პარამეტრები" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SettingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = await getSettings();

  return (
    <>
      <PageHeader title="პარამეტრები" description="მაღაზიის კონტაქტები, მიწოდება, Telegram შეტყობინებები, ლოგო და პაროლი" />
      <Notice params={sp} />

      <div className="grid gap-6 xl:grid-cols-2">
        <form action={saveStoreSettings} className="space-y-6">
          <Card title="მაღაზია და კონტაქტი">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="მაღაზიის სახელი">
                <input name="storeName" defaultValue={s.storeName} className="field" />
              </Field>
              <Field label="ელფოსტა">
                <input name="email" type="email" defaultValue={s.email} className="field" />
              </Field>
              <Field label="ტელეფონი" hint="ჩანს ჰედერში, ფუტერში და პროდუქტის გვერდზე">
                <input name="phone" defaultValue={s.phone} className="field" placeholder="+995 5XX XX XX XX" />
              </Field>
              <Field label="WhatsApp ნომერი" hint="მხოლოდ ციფრები ქვეყნის კოდით, მაგ. 995596798877">
                <input name="whatsapp" defaultValue={s.whatsapp} className="field" inputMode="numeric" />
              </Field>
              <Field label="მისამართი (ქართულად)">
                <input name="addressKa" defaultValue={s.addressKa} className="field" />
              </Field>
              <Field label="Address (English)">
                <input name="addressEn" defaultValue={s.addressEn} className="field" />
              </Field>
              <Field label="სამუშაო საათები (ქართულად)">
                <input name="workingHoursKa" defaultValue={s.workingHoursKa} className="field" />
              </Field>
              <Field label="Working hours (English)">
                <input name="workingHoursEn" defaultValue={s.workingHoursEn} className="field" />
              </Field>
              <Field label="Instagram (ბმული)">
                <input name="instagram" defaultValue={s.instagram} className="field" placeholder="https://instagram.com/…" />
              </Field>
              <Field label="Facebook (ბმული)">
                <input name="facebook" defaultValue={s.facebook} className="field" placeholder="https://facebook.com/…" />
              </Field>
              <Field label="TikTok (ბმული)">
                <input name="tiktok" defaultValue={s.tiktok} className="field" placeholder="https://tiktok.com/@…" />
              </Field>
            </div>
          </Card>

          <Card title="მიწოდება">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="მიწოდების ფასი (₾)">
                <input name="shippingFee" defaultValue={gelInput(s.shippingFee)} className="field" inputMode="decimal" />
              </Field>
              <Field label="უფასო მიწოდება (₾)-დან" hint="0 = უფასო მიწოდება არ არის">
                <input name="freeShippingFrom" defaultValue={gelInput(s.freeShippingFrom)} className="field" inputMode="decimal" />
              </Field>
              <Field label="მიწოდების ვადა (დღე)">
                <input name="deliveryDays" defaultValue={s.deliveryDays} className="field" placeholder="1-3" />
              </Field>
            </div>
          </Card>

          <Card title="ლოგო" description={assets.logo ? `brand/ საქაღალდიდან ნაპოვნია: ${assets.logo}. აქ ატვირთული ლოგო უპირატესია.` : "ლოგოს brand/ საქაღალდეშიც შეგიძლია ჩადო (logo.svg / logo-white.svg). სანამ ლოგო არ არის, ტექსტური „LYON“ ჩანს."}>
            <div className="grid gap-5 sm:grid-cols-2">
              <ImageField name="logoUrl" label="ლოგო (ღია ფონისთვის)" defaultValue={s.logoUrl} aspect="aspect-[3/1]" maxSize={800} />
              <ImageField name="logoWhiteUrl" label="თეთრი ლოგო (მუქი ფონისთვის)" defaultValue={s.logoWhiteUrl} aspect="aspect-[3/1]" maxSize={800} hint="თუ არ არის, ღია ვერსია ავტომატურად გათეთრდება" />
            </div>
          </Card>

          <button type="submit" className="btn btn-primary">
            <Save className="h-4 w-4" /> პარამეტრების შენახვა
          </button>
        </form>

        <div className="space-y-6">
          <Card title="Telegram შეტყობინებები" description="ყოველ ახალ შეკვეთაზე მესიჯი მოვა Telegram-ში.">
            <ol className="mb-4 list-decimal space-y-1 pl-5 text-[13px] text-muted">
              <li>
                Telegram-ში გახსენი <b>@BotFather</b>, დაწერე <code>/newbot</code> და მიიღე ტოკენი.
              </li>
              <li>შენს ახალ ბოტს მიწერე რამე (მაგ. „გამარჯობა“).</li>
              <li>
                Chat ID-ს გასაგებად გახსენი <b>@userinfobot</b> ან ბრაუზერში: <code>https://api.telegram.org/bot&lt;ტოკენი&gt;/getUpdates</code>.
              </li>
              <li>ჩაწერე ორივე და დააჭირე „ტესტი“.</li>
            </ol>
            <form className="space-y-4">
              <Field label="ბოტის ტოკენი">
                <input name="telegramBotToken" defaultValue={s.telegramBotToken} className="field font-mono text-sm" placeholder="123456789:AAH…" autoComplete="off" />
              </Field>
              <Field label="Chat ID">
                <input name="telegramChatId" defaultValue={s.telegramChatId} className="field font-mono text-sm" placeholder="123456789" autoComplete="off" />
              </Field>
              <div className="flex gap-2">
                <button type="submit" formAction={saveStoreSettings} className="btn btn-primary btn-sm">
                  <Save className="h-4 w-4" /> შენახვა
                </button>
                <button type="submit" formAction={testTelegram} className="btn btn-outline btn-sm">
                  <Send className="h-4 w-4" /> შენახვა და ტესტი
                </button>
              </div>
            </form>
          </Card>

          <Card title="ადმინის პაროლი">
            <form action={changePassword} className="space-y-4">
              <Field label="მიმდინარე პაროლი">
                <input name="current" type="password" required autoComplete="current-password" className="field" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ახალი პაროლი" hint="მინ. 8 სიმბოლო">
                  <input name="next" type="password" required minLength={8} autoComplete="new-password" className="field" />
                </Field>
                <Field label="გაიმეორე">
                  <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className="field" />
                </Field>
              </div>
              <button type="submit" className="btn btn-outline btn-sm">
                <KeyRound className="h-4 w-4" /> პაროლის შეცვლა
              </button>
            </form>
          </Card>

          <Card title="ფონტები" description="Google Sans">
            <p className="text-[13px] text-muted">
              {assets.localGoogleSans
                ? `ლოკალური ფონტები ჩართულია: ${assets.localFamilies.join(" + ")} (${assets.localWeights.length ? "წონები " + assets.localWeights.join(", ") : "ვარიაბელური"}). ფაილები: fonts/ საქაღალდე.`
                : "Google Sans იტვირთება Google Fonts-იდან (ქართული სუბსეტით, 400–700). საკუთარი ფაილების გამოსაყენებლად ჩადე fonts/ საქაღალდეში და გაუშვი npm run fonts."}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
