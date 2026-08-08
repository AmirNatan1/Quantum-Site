import { legalDetails, publicContact } from "../data";
import { getConfiguredSiteUrl } from "./site-url";

export { getConfiguredSiteUrl } from "./site-url";

export function OrganizationStructuredData() {
  const siteUrl = getConfiguredSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Quantum Hub",
    legalName: legalDetails.entityName,
    identifier: legalDetails.companyNumber,
    sameAs: [publicContact.linkedin],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Arik Einstein 3, 8th floor",
      addressLocality: "Herzliya",
      postalCode: "4659071",
      addressCountry: "IL",
    },
    ...(siteUrl
      ? {
          url: siteUrl.href,
          logo: new URL("/quantum-logo.svg", siteUrl).href,
        }
      : {}),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
