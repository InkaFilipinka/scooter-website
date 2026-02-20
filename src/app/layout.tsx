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
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  description:
    "Affordable scooter rental in General Luna, Siargao del Norte. Daily and weekly motorbike rentals with free helmets, airport pickup, and island-wide delivery. Book now.",
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
      "Rent reliable scooters in General Luna, Siargao del Norte. Free helmets, airport pickup, and easy online booking.",
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
      "Scooter rental in General Luna, Siargao del Norte. Affordable daily & weekly rates.",
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
