import Link from "next/link";
import clsx from "clsx";
import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className, title, description }: { children: ReactNode; className?: string; title?: string; description?: string }) {
  return (
    <section className={clsx("rounded-2xl border border-line bg-white", className)}>
      {title ? (
        <header className="border-b border-line px-5 py-4">
          <h2 className="font-semibold">{title}</h2>
          {description ? <p className="mt-0.5 text-[13px] text-muted">{description}</p> : null}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={clsx("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[12px] text-muted">{hint}</span> : null}
    </label>
  );
}

export function Toggle({ name, label, defaultChecked, description }: { name: string; label: string; defaultChecked?: boolean; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 hover:bg-cream/40">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 h-4.5 w-4.5 accent-ink" />
      <span>
        <span className="block text-[14px] font-medium">{label}</span>
        {description ? <span className="block text-[12px] text-muted">{description}</span> : null}
      </span>
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "ახალი", cls: "bg-accent/10 text-accent" },
    confirmed: { label: "დადასტურებული", cls: "bg-blue-500/10 text-blue-700" },
    shipped: { label: "გზაშია", cls: "bg-warning/15 text-amber-700" },
    delivered: { label: "მიწოდებული", cls: "bg-success/10 text-success" },
    cancelled: { label: "გაუქმებული", cls: "bg-ink/5 text-muted" },
  };
  const s = map[status] ?? { label: status, cls: "bg-ink/5 text-muted" };
  return <span className={clsx("badge", s.cls)}>{s.label}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <p className="font-medium">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
      ← {label}
    </Link>
  );
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("ka-GE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

export function formatDay(d: Date): string {
  return new Intl.DateTimeFormat("ka-GE", { day: "2-digit", month: "short" }).format(d);
}
