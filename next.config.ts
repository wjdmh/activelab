import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      // HTML 페이지만 캐시 방지 (JS/CSS/이미지는 캐시 허용)
      source: "/:path((?!_next/static|_next/image|favicon).*)",
      headers: [
        { key: "Cache-Control", value: "no-cache, must-revalidate" },
      ],
    },
  ],
};

export default nextConfig;
