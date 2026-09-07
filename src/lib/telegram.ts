import { formatPrice } from "./money";

export type TelegramResult = { ok: true } | { ok: false; error: string };

export async function sendTelegram(token: string, chatId: string, text: string): Promise<TelegramResult> {
  if (!token || !chatId) return { ok: false, error: "Telegram ტოკენი ან chat id არ არის მითითებული" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    const json = (await res.json()) as { ok: boolean; description?: string };
    return json.ok ? { ok: true } : { ok: false, error: json.description ?? "Telegram API შეცდომა" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function esc(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type OrderForMessage = {
  number: string;
  customerName: string;
  phone: string;
  city: string;
  address: string;
  comment: string | null;
  subtotal: number;
  discount: number;
  promoCode: string | null;
  shipping: number;
  total: number;
  items: { name: string; size: string; color: string | null; qty: number; unitPrice: number; lineTotal: number }[];
};

export function formatOrderMessage(order: OrderForMessage, adminUrl: string): string {
  const lines: string[] = [];
  lines.push(`🛒 <b>ახალი შეკვეთა ${esc(order.number)}</b>`);
  lines.push("");
  for (const it of order.items) {
    lines.push(`• ${esc(it.name)} — ზომა ${esc(it.size)}${it.color ? `, ${esc(it.color)}` : ""} × ${it.qty} = <b>${formatPrice(it.lineTotal)}</b>`);
  }
  lines.push("");
  if (order.discount > 0) lines.push(`ფასდაკლება${order.promoCode ? ` (${esc(order.promoCode)})` : ""}: −${formatPrice(order.discount)}`);
  lines.push(`მიწოდება: ${order.shipping > 0 ? formatPrice(order.shipping) : "უფასო"}`);
  lines.push(`<b>სულ: ${formatPrice(order.total)}</b>`);
  lines.push("");
  lines.push(`👤 ${esc(order.customerName)}`);
  lines.push(`📞 ${esc(order.phone)}`);
  lines.push(`📍 ${esc(order.city)}, ${esc(order.address)}`);
  if (order.comment) lines.push(`💬 ${esc(order.comment)}`);
  lines.push("");
  lines.push(`🔗 ${adminUrl}`);
  return lines.join("\n");
}
