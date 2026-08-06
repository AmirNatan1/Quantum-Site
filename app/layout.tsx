import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./styles/signal.css";
import { getConfiguredSiteUrl, OrganizationStructuredData } from "./lib/structured-data";

const siteUrl = getConfiguredSiteUrl();
const socialImage = siteUrl ? new URL("/og-signal-v1.png", siteUrl).href : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: {
    default: "Quantum-hub — Corporate innovation, proven in the field",
    template: "%s",
  },
  description:
    "The shared innovation arm of Bazan, Hyundai, VDL and Taavura-Livnat. Operational needs become technology searches, then field evidence.",
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    siteName: "Quantum-hub",
    title: "Quantum-hub — Corporate innovation, proven in the field",
    description: "Operational needs become technology searches, then field evidence.",
    images: socialImage ? [{ url: socialImage, width: 1731, height: 909, alt: "An operational signal moving through testing stages toward a proven outcome." }] : undefined,
  },
  twitter: { card: "summary_large_image", images: socialImage ? [socialImage] : undefined },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F9F9",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><OrganizationStructuredData />{children}</body>
    </html>
  );
}
