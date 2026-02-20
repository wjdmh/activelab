import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "온유 (On-U) — 나만의 맞춤 운동",
    short_name: "온유",
    description: "나에게 꼭 맞는 운동 프로그램. 목표에 따라 맞춤으로 만들어드려요.",
    start_url: "/",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#FF5414",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
