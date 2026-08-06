import type { MetadataRoute } from "next";
import { routeMetadata } from "./data";
import { getConfiguredSiteUrl } from "./lib/structured-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getConfiguredSiteUrl();
  if (!siteUrl) return [];

  return Object.entries(routeMetadata)
    .filter(([, metadata]) => metadata.indexing === "index,follow")
    .map(([route]) => ({
      url: new URL(route === "/" ? "/" : route, siteUrl).href,
      changeFrequency: "monthly" as const,
      priority: route === "/" ? 1 : route === "/contact" || route === "/spark" ? 0.8 : 0.7,
    }));
}
