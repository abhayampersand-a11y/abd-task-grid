import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { StoreProvider } from "@/store/provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TaskFlow Pro — Group-based task management",
    template: "%s · TaskFlow Pro",
  },
  description:
    "Break down silos and accelerate workflows. TaskFlow Pro provides the granular control and high-speed collaboration tools high-performance teams demand.",
};

export const viewport: Viewport = {
  themeColor: "#e4318e",
  width: "device-width",
  initialScale: 1,
  // Content is laid out edge-to-edge on phones; `env(safe-area-inset-*)`
  // keeps the tab bar clear of the home indicator.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <StoreProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: "12px",
                fontSize: "13.5px",
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
