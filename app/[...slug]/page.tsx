import type { Metadata } from "next";
import SiteExperience from "../SiteExperience";
import { routeMetadata } from "../content";

type PageProps = { params: Promise<{ slug: string[] }> };

function toRoute(slug: string[]) {
  return `/${slug.join("/")}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = toRoute(slug);
  const page = routeMetadata[route] || {
    title: "Quantum-hub",
    description: "Operational needs. Proven technology.",
  };
  return {
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
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  return <SiteExperience route={toRoute(slug)} />;
}
