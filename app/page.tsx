import type { Metadata } from "next";
import SiteExperience from "./SiteExperience";
import { routeMetadata } from "./content";

const page = routeMetadata["/"];

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  openGraph: {
    title: page.title,
    description: page.description,
    type: "website",
    images: [{ url: "/og.png", width: 1729, height: 910, alt: "Quantum-hub — Operational needs. Proven technology." }],
  },
  twitter: {
    card: "summary_large_image",
    title: page.title,
    description: page.description,
    images: ["/og.png"],
  },
};

export default function Home() {
  return <SiteExperience route="/" />;
}
