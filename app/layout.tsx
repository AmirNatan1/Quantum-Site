import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quantum-hub.com"),
  title: {
    default: "Quantum-hub — Corporate innovation, proven in the field",
    template: "%s",
  },
  description:
    "The shared innovation arm of Bazan, Hyundai, VDL and Taavura-Livnat. Operational needs become technology searches, then field evidence.",
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
