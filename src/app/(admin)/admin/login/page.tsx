import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const admin = await getAdmin();
  if (admin) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <p className="wordmark text-center text-4xl">LYON</p>
        <p className="mt-2 text-center text-sm text-muted">ადმინ პანელი</p>
        <div className="card mt-8 p-6">
          <LoginForm next={next ?? ""} />
        </div>
        <p className="mt-6 text-center text-[12px] text-muted">
          © {new Date().getFullYear()} LYON · <Link href="/" className="underline">საიტზე გადასვლა</Link>
        </p>
      </div>
    </div>
  );
}
