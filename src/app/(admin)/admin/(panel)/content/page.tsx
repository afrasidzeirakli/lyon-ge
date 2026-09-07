import { RefreshCw, Save } from "lucide-react";
import { sections, getAllContent, pick, type FieldDef, type SectionData } from "@/lib/content";
import { saveContentSection, resetContentSection } from "@/lib/admin/actions/content";
import { PageHeader } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Notice } from "@/components/admin/Notice";

export const metadata = { title: "საიტის კონტენტი" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function FieldInput({ field, data }: { field: FieldDef; data: SectionData }) {
  const value = data[field.key];
  if (field.type === "image") {
    return <ImageField name={field.key} label={field.label} defaultValue={typeof value === "string" ? value : ""} hint={field.help} aspect="aspect-video" />;
  }
  if (field.localized) {
    const ka = pick(value, "ka");
    const en = pick(value, "en");
    const Tag = field.type === "textarea" ? "textarea" : "input";
    return (
      <div>
        <span className="mb-1.5 block text-[13px] font-medium">{field.label}</span>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">ქართული</span>
            <Tag name={`${field.key}__ka`} defaultValue={ka} className={field.type === "textarea" ? "field-area min-h-20" : "field"} rows={field.type === "textarea" ? 3 : undefined} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold tracking-wider text-muted uppercase">English</span>
            <Tag name={`${field.key}__en`} defaultValue={en} className={field.type === "textarea" ? "field-area min-h-20" : "field"} rows={field.type === "textarea" ? 3 : undefined} />
          </label>
        </div>
        {field.help ? <span className="mt-1 block text-[12px] text-muted">{field.help}</span> : null}
      </div>
    );
  }
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea name={field.key} defaultValue={typeof value === "string" ? value : ""} className="field-area min-h-20" rows={3} />
      ) : (
        <input name={field.key} defaultValue={typeof value === "string" ? value : ""} className="field" placeholder={field.type === "url" ? "/shop" : ""} />
      )}
      {field.help ? <span className="mt-1 block text-[12px] text-muted">{field.help}</span> : null}
    </label>
  );
}

export default async function ContentPage({ searchParams }: Props) {
  const sp = await searchParams;
  const open = typeof sp.open === "string" ? sp.open : null;
  const content = await getAllContent();

  return (
    <>
      <PageHeader title="საიტის კონტენტი" description="მთავარი გვერდის სექციების ტექსტები და ფოტოები ორივე ენაზე. სათაურებში *სიტყვა* ვარსკვლავებით = ნაცრისფერი აქცენტი." />
      <Notice params={sp} />
      <div className="space-y-4">
        {sections.map((section, i) => (
          <details key={section.key} id={section.key} open={open ? open === section.key : i === 0} className="group rounded-2xl border border-line bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 select-none">
              <div>
                <h2 className="font-semibold">{section.title}</h2>
                {section.description ? <p className="mt-0.5 text-[13px] text-muted">{section.description}</p> : null}
              </div>
              <span className="text-muted transition group-open:rotate-180">▾</span>
            </summary>
            <div className="border-t border-line p-5">
              <form action={saveContentSection} className="space-y-5">
                <input type="hidden" name="key" value={section.key} />
                {section.fields.map((f) => (
                  <FieldInput key={f.key} field={f} data={content[section.key] ?? {}} />
                ))}
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Save className="h-4 w-4" /> შენახვა
                  </button>
                  <ConfirmSubmit formAction={resetContentSection} message="ამ სექციის ყველა ცვლილება წაიშლება და ნაგულისხმევი ტექსტები/ფოტოები დაბრუნდება. გავაგრძელო?" className="ml-auto text-muted hover:bg-ink/5 hover:text-ink">
                    <RefreshCw className="h-4 w-4" /> ნაგულისხმევის აღდგენა
                  </ConfirmSubmit>
                </div>
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
