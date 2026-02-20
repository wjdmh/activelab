import type { Metadata, Viewport } from "next";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "ON-U | 나만을 위한 AI 피지컬 코치",
  description:
    "부상 관리부터 기능 향상까지. 즐기는 운동을 더 오래 즐기고 싶은 당신을 위한 AI 코치.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ON-U",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3182F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthInitializer />
        <div className="mx-auto max-w-lg min-h-dvh relative bg-bg-primary">
          {children}
        </div>
        <ClientProviders />
      </body>
    </html>
  );
}
