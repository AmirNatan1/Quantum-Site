import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./styles/signal.css";
import { getConfiguredSiteUrl, OrganizationStructuredData } from "./lib/structured-data";

const siteUrl = getConfiguredSiteUrl();

export const metadata: Metadata = {
  metadataBase: siteUrl ?? undefined,
  title: {
    default: "Quantum Hub | Field-tested evidence for industrial technology",
    template: "%s",
  },
  description: "Quantum Hub connects operational needs inside major industrial groups with technology that is ready to be tested, then designs and runs the POC that produces a real answer.",
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    siteName: "Quantum Hub",
    title: "Quantum Hub | Field-tested evidence for industrial technology",
    description: "An industrial consortium that turns operational needs into field-tested evidence.",
  },
  twitter: { card: "summary" },
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
