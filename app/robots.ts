import type { MetadataRoute } from "next";
import { getConfiguredSiteUrl } from "./lib/structured-data";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getConfiguredSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: siteUrl ? new URL("/sitemap.xml", siteUrl).href : undefined,
  };
}
