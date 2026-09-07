import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="wordmark text-[28vw] leading-none text-ink/10 sm:text-[12rem]">404</p>
      <h1 className="display -mt-6 text-3xl sm:text-4xl">ᲒᲕᲔᲠᲓᲘ ᲕᲔᲠ ᲛᲝᲘᲫᲔᲑᲜᲐ / Page not found</h1>
      <p className="mt-3 max-w-md text-muted">ეს გვერდი არ არსებობს ან წაშლილია. This page doesn’t exist or has been removed.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn btn-primary">
          მთავარი
        </Link>
        <Link href="/en" className="btn btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}
