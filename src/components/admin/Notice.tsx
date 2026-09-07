import { CircleCheck, TriangleAlert } from "lucide-react";

const MESSAGES: Record<string, string> = {
  saved: "შენახულია",
  deleted: "წაშლილია",
  created: "შეიქმნა",
  reset: "ნაგულისხმევი მნიშვნელობები აღდგა",
  tgok: "Telegram შეტყობინება გაიგზავნა ✓",
  pwok: "პაროლი შეიცვალა",
};

/** გვერდის ზედა შეტყობინება ?saved=1 / ?error=... პარამეტრებით */
export function Notice({ params }: { params: Record<string, string | string[] | undefined> }) {
  const ok = Object.keys(MESSAGES).find((k) => params[k] === "1");
  const error = typeof params.error === "string" ? params.error : null;
  if (!ok && !error) return null;
  return (
    <div className={`mb-5 flex items-start gap-2.5 rounded-xl px-4 py-3 text-[14px] ${error ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
      {error ? <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{error ? decodeURIComponent(error) : MESSAGES[ok!]}</span>
    </div>
  );
}
