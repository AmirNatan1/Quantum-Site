type SiteUrlEnvironment = Readonly<{
  NEXT_PUBLIC_SITE_URL?: string;
  CF_PAGES?: string;
  CF_PAGES_BRANCH?: string;
}>;

function isPagesMainBuild(environment: SiteUrlEnvironment) {
  return environment.CF_PAGES === "1" && environment.CF_PAGES_BRANCH === "main";
}

function parseHttpsOrigin(value: string | undefined) {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    ) {
      return null;
    }
    return new URL(url.origin);
  } catch {
    return null;
  }
}

export function getConfiguredSiteUrl(environment: SiteUrlEnvironment = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  CF_PAGES: process.env.CF_PAGES,
  CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
}) {
  const siteUrl = parseHttpsOrigin(environment.NEXT_PUBLIC_SITE_URL);
  if (siteUrl) return siteUrl;

  if (isPagesMainBuild(environment)) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be configured as a valid HTTPS origin for the Cloudflare Pages main production build.",
    );
  }

  return null;
}
