import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import { UIProvider } from "@/components/ui/UIProvider";
import UniversalLoader from "@/components/ui/UniversalLoader";
import "./globals.css";
import DisableDevTools from "@/components/layout/disable-dev-tools";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "optional",
  preload: true,
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
  weight: ["400", "700"],
  display: "optional",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://appharmacycouncil.com"),

  title: {
    default: "Arunachal Pradesh Pharmacy Council | Official Portal",
    template: "%s | Arunachal Pradesh Pharmacy Council",
  },

  description:
    "Official portal of Arunachal Pradesh Pharmacy Council for pharmacist registration, renewals, certificate verification, notices, tenders and council services.",

  keywords: [
    "APPC",
    "Arunachal Pradesh Pharmacy Council",
    "Arunachal Pharmacy Council",
    "pharmacist registration Arunachal Pradesh",
    "pharmacy council Arunachal",
  ],

  applicationName: "Arunachal Pradesh Pharmacy Council",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "Arunachal Pradesh Pharmacy Council",
    description:
      "Official portal for pharmacist registration, renewals and certificate verification.",
    url: "https://appharmacycouncil.com",
    siteName: "Arunachal Pradesh Pharmacy Council",
    locale: "en_IN",
    type: "website",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    title: "APPC",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${merriweather.variable} antialiased min-h-screen`}
      >
        {/* <DisableDevTools /> */}
        <UniversalLoader />
        <UIProvider>{children}</UIProvider>
      </body>
    </html>
  );
}
