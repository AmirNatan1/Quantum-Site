import type { Metadata } from "next";
import SiteExperience from "../SiteExperience";
import { routeMetadata } from "../content";
import { getConfiguredSiteUrl } from "../lib/structured-data";

type PageProps = { params: Promise<{ slug: string[] }> };

function toRoute(slug: string[]) {
  return `/${slug.join("/")}`;
}

export function generateStaticParams() {
  return Object.keys(routeMetadata)
    .filter((route) => route !== "/")
    .map((route) => ({ slug: route.slice(1).split("/") }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = toRoute(slug);
  const page = routeMetadata[route] || {
    title: "Quantum-hub",
    description: "Operational needs. Proven technology.",
  };
  const siteUrl = getConfiguredSiteUrl();
  const socialImage = siteUrl ? new URL("/og-signal-v1.png", siteUrl).href : undefined;
  return {
    title: page.title,
    description: page.description,
    alternates: siteUrl ? { canonical: route } : undefined,
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
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  return <SiteExperience route={toRoute(slug)} />;
}
