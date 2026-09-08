import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Vercel Blob — ადმინიდან ატვირთული ფოტოები Vercel-ზე
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Vercel-ზე serverless ფუნქციის რექვესთის ლიმიტი ~4.5MB-ია
    serverActions: { bodySizeLimit: process.env.VERCEL ? "4mb" : "25mb" },
  },
  // www.lyon.ge -> lyon.ge (ერთი კანონიკური მისამართი საძიებო სისტემებისთვის)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.lyon.ge" }],
        destination: "https://lyon.ge/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
