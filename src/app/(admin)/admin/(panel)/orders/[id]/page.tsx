import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, Trash } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { telLink, whatsappLink } from "@/lib/settings";
import { ORDER_STATUSES } from "@/i18n/dictionaries";
import { updateOrderStatus, deleteOrder } from "@/lib/admin/actions/orders";
import { BackLink, Card, PageHeader, StatusBadge, formatDate } from "@/components/admin/ui";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Notice } from "@/components/admin/Notice";
import { WhatsAppIcon } from "@/components/site/WhatsAppFab";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

const LABELS: Record<string, string> = { new: "ახალი", confirmed: "დადასტურებული", shipped: "გზაშია", delivered: "მიწოდებული", cancelled: "გაუქმებული" };

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: { include: { product: { select: { id: true } } } } } });
  if (!order) notFound();

  return (
    <>
      <BackLink href="/admin/orders" label="შეკვეთები" />
      <PageHeader
        title={`შეკვეთა ${order.number}`}
        description={`${formatDate(order.createdAt)} · ენა: ${order.lang.toUpperCase()}`}
        actions={
          <>
            <StatusBadge status={order.status} />
            <form action={deleteOrder}>
              <input type="hidden" name="id" value={order.id} />
              <ConfirmSubmit message="წავშალო შეკვეთა? მარაგი არ აღდგება — ჯერ „გაუქმებული“ სტატუსი დააყენე, თუ მარაგის დაბრუნება გინდა.">
                <Trash className="h-4 w-4" /> წაშლა
              </ConfirmSubmit>
            </form>
          </>
        }
      />
      <Notice params={sp} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card title="ნივთები">
          <ul className="divide-y divide-line">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center gap-4 py-3">
                <span className="product-media relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-line">{it.imageUrl ? <Image src={it.imageUrl} alt="" fill sizes="56px" className="object-cover" /> : null}</span>
                <div className="min-w-0 flex-1">
                  {it.productId ? (
                    <Link href={`/admin/products/${it.productId}`} className="block truncate font-medium hover:underline">
                      {it.name}
                    </Link>
                  ) : (
                    <p className="truncate font-medium">{it.name}</p>
                  )}
                  <p className="text-[12px] text-muted">
                    ზომა {it.size}
                    {it.color ? ` · ${it.color}` : ""} · {it.qty} × {formatPrice(it.unitPrice)}
                  </p>
                </div>
                <p className="font-medium tabular-nums">{formatPrice(it.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-muted">ჯამი</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between text-success">
                <dt>ფასდაკლება {order.promoCode ? `(${order.promoCode})` : ""}</dt>
                <dd className="tabular-nums">−{formatPrice(order.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted">მიწოდება</dt>
              <dd className="tabular-nums">{order.shipping === 0 ? "უფასო" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <dt>სულ</dt>
              <dd className="tabular-nums">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card title="მიმღები">
            <p className="font-medium">{order.customerName}</p>
            <p className="mt-1 text-[14px]">
              {order.city}, {order.address}
            </p>
            {order.comment ? <p className="mt-2 rounded-xl bg-cream px-3 py-2 text-[13px]">💬 {order.comment}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={telLink(order.phone)} className="btn btn-outline btn-sm">
                <Phone className="h-4 w-4" /> {order.phone}
              </a>
              <a href={whatsappLink(order.phone, `გამარჯობა, ${order.customerName}! თქვენი შეკვეთა ${order.number} მიღებულია.`)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </Card>

          <Card title="სტატუსის შეცვლა" description="გაუქმებისას მარაგი ავტომატურად ბრუნდება">
            <form action={updateOrderStatus} className="space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="field">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {LABELS[s]}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary btn-sm w-full">
                განახლება
              </button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
