import type { MetadataRoute } from "next";
import { routeMetadata } from "./data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://quantum-hub.com";
  return Object.keys(routeMetadata).map((route) => ({
    url: `${base}${route === "/" ? "" : route}`,
    changeFrequency: route === "/updates" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/contact" || route === "/spark" ? 0.8 : 0.7,
  }));
}
