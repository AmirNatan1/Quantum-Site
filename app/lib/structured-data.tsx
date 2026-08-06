export function getConfiguredSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function OrganizationStructuredData() {
  const siteUrl = getConfiguredSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Quantum-hub",
    sameAs: ["https://www.linkedin.com/company/quantum-hub/"],
    address: { "@type": "PostalAddress", addressLocality: "Herzliya", addressCountry: "IL" },
    ...(siteUrl
      ? {
          url: siteUrl.href,
          logo: new URL("/quantum-logo.svg", siteUrl).href,
        }
      : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
