import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/store/provider";
import {
  THEME_INIT_SCRIPT,
  ThemeProvider,
} from "@/components/theme/theme-provider";
import { ThemedToaster } from "@/components/theme/themed-toaster";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4f39f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e15" },
  ],
  width: "device-width",
  initialScale: 1,
  // Content runs edge-to-edge; `env(safe-area-inset-*)` keeps the tab bar and
  // sheet footers clear of the notch and home indicator.
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
      suppressHydrationWarning
    >
      <head>
        {/* Applies the stored theme before first paint — without this the page
            flashes light before React hydrates.

            `suppressHydrationWarning` because this tag is a common target for
            browser extensions, which rewrite its contents and would otherwise
            trip React's attribute diff on every load. */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <StoreProvider>
            {children}
            <ThemedToaster />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
