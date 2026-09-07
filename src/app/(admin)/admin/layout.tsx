import type { Metadata } from "next";
import "@/app/globals.css";
import assets from "@/generated/assets.json";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "ადმინ პანელი — LYON", template: "%s — LYON ადმინი" },
  robots: { index: false, follow: false },
};

const GOOGLE_FONTS_FAMILIES = [
  ...(assets.localGoogleSans ? [] : ["family=Google+Sans:GRAD,wght@-50..200,400..700"]),
  ...(assets.localGoogleSansFlex ? [] : ["family=Google+Sans+Flex:GRAD,wdth,wght@0..100,25..151,100..1000"]),
];
const FONTS_HREF = GOOGLE_FONTS_FAMILIES.length > 0 ? `https://fonts.googleapis.com/css2?${GOOGLE_FONTS_FAMILIES.join("&")}&display=swap` : null;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka" className="h-full">
      <head>
        {FONTS_HREF ? (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={FONTS_HREF} />
          </>
        ) : null}
      </head>
      <body className="admin-body min-h-full text-ink">{children}</body>
    </html>
  );
}
