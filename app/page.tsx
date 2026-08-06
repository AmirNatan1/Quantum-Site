import type { Metadata } from "next";
import SiteExperience from "./SiteExperience";
import { routeMetadata } from "./content";
import { getConfiguredSiteUrl } from "./lib/structured-data";

const page = routeMetadata["/"];
const siteUrl = getConfiguredSiteUrl();

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  alternates: siteUrl ? { canonical: "/" } : undefined,
  openGraph: {
    title: page.title,
    description: page.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: page.title,
    description: page.description,
  },
};

export default function Home() {
  return <SiteExperience route="/" />;
}
