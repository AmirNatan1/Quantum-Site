import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const page = routeMetadata[route];
  if (!page) notFound();
  const siteUrl = getConfiguredSiteUrl();
  return {
    title: page.title,
    description: page.description,
    robots: page.indexing,
    alternates: siteUrl ? { canonical: route } : undefined,
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
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const route = toRoute(slug);
  if (!routeMetadata[route]) notFound();
  return <SiteExperience route={route} />;
}
