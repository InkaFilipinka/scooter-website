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
  weight: ["400", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://siargaoscooterrentals.com'),
  title: {
    default: "Siargao Scooter Rental & Hire in General Luna",
    template: "%s | Scooter Rental Siargao"
  },
  icons: {
    icon: [
      { url: '/favicon-192x192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/favicon-192x192.png',
  },
  description:
    "Affordable scooter rental in Siargao with fast delivery, no deposit, instant booking. Helmet, phone holder & insurance included. Book in 1–3 minutes. General Luna, Dapa, Del Carmen.",
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
    title: "Siargao Scooter Rental & Hire in General Luna",
    description:
      "Affordable scooter rental in Siargao with fast delivery, no deposit, instant booking. Helmet, phone holder & insurance included. General Luna, Dapa, Del Carmen.",
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
    title: "Siargao Scooter Rental & Hire in General Luna",
    description:
      "Affordable scooter rental in Siargao with fast delivery, no deposit, instant booking. Helmet, phone holder & insurance included. General Luna, Dapa, Del Carmen.",
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
