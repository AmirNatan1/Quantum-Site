import type { Metadata } from "next";
import SiteExperience from "./SiteExperience";
import { routeMetadata } from "./content";
import { getConfiguredSiteUrl } from "./lib/structured-data";

const page = routeMetadata["/"];
const siteUrl = getConfiguredSiteUrl();
const socialImage = siteUrl ? new URL("/og-signal-v1.png", siteUrl).href : undefined;

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    title: page.title,
    description: page.description,
    type: "website",
    images: socialImage ? [{ url: socialImage, width: 1731, height: 909, alt: "Quantum-hub — Operational needs. Proven technology." }] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: page.title,
    description: page.description,
    images: socialImage ? [socialImage] : undefined,
  },
};

export default function Home() {
  return <SiteExperience route="/" />;
}
