import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { LanguageProvider } from "@/contexts/language-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { GoogleAnalytics } from "@/components/google-analytics";
import { GoogleAdsTag } from "@/components/google-ads-tag";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://siargaoscooterrentals.com'),
  title: {
    default: "Scooter Rental in Siargao | General Luna, Siargao del Norte",
    template: "%s | Scooter Rental Siargao"
  },
  icons: {
    icon: [
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon-192x192.png',
  },
  description:
    "Siargao scooter rental with free helmet, insurance and no deposit. Fast online booking in 1–3 minutes with islandwide delivery in General Luna and Siargao Del Norte.",
  keywords: [
    "scooter rental siargao",
    "scooter rental general luna",
    "scooter rental siargao del norte",
    "motorbike rental siargao",
    "motorcycle rental general luna",
    "siargao scooter hire",
    "palm riders siargao"
  ],
  alternates: {
    canonical: "https://siargaoscooterrentals.com",
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: "https://siargaoscooterrentals.com",
    siteName: "Palm Riders Scooter Rentals",
    title: "Scooter Rental in Siargao | General Luna",
    description:
      "Siargao scooter rental with free helmet, insurance and no deposit. Fast online booking in 1–3 minutes with islandwide delivery in General Luna and Siargao Del Norte.",
    images: [
      {
        url: "/images/hero-poster.webp",
        width: 1200,
        height: 630,
        alt: "Scooter Rental in Siargao - General Luna",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scooter Rental in Siargao | General Luna",
    description:
      "Siargao scooter rental with free helmet, insurance and no deposit. Fast online booking in 1–3 minutes with islandwide delivery in General Luna and Siargao Del Norte.",
    images: ["/images/hero-poster.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preload" as="image" href="/images/hero-poster.webp" />
      </head>
      <body className={inter.className}>
        <GoogleAnalytics />
        <GoogleAdsTag />
        <ThemeProvider>
          <LanguageProvider>
            <Navigation />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
