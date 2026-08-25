import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Preferences, PREFERENCE_BOOTSTRAP } from "@/components/preferences";
import { DEFAULT_LOCALE, DICTS } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE = "https://roto-live.vercel.app";
const base = DICTS[DEFAULT_LOCALE];

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: base.meta.title, template: "%s · Roto" },
  description: base.meta.description,
  applicationName: "Roto",
  keywords: [
    "hapus background",
    "background remover",
    "png transparan",
    "transparent png",
    "potong subjek",
    "ganti warna latar",
  ],
  authors: [{ name: "Roto" }],
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Roto",
    title: base.meta.title,
    description: base.meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: base.meta.title,
    description: base.meta.description,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir="ltr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Stamps theme and language before the first paint. Without this
            the page flashes the wrong palette on every cold load. */}
        <script dangerouslySetInnerHTML={{ __html: PREFERENCE_BOOTSTRAP }} />
      </head>
      <body className="min-h-full">
        <Preferences>{children}</Preferences>
      </body>
    </html>
  );
}
