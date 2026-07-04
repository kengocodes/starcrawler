/**
 * SEO configuration and utilities
 */

/**
 * Validates and normalizes the site URL from environment variable.
 * Ensures the URL is properly formatted, uses HTTPS in production, and has no trailing slash.
 */
function validateSiteUrl(
  url: string | undefined,
  isProduction: boolean
): string | null {
  if (!url) {
    return null;
  }

  const normalizedUrl = url.trim().replace(/\/$/, "");

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    return null;
  }

  if (isProduction && parsedUrl.protocol !== "https:") {
    return null;
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return null;
  }

  if (!parsedUrl.hostname || parsedUrl.hostname.length === 0) {
    return null;
  }

  return normalizedUrl;
}

const isProduction = process.env.NODE_ENV === "production";
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const validatedSiteUrl = validateSiteUrl(rawSiteUrl, isProduction);

const FALLBACK_URL = "https://starcrawler.vercel.app";

export const siteConfig = {
  name: "Star Crawler",
  url: validatedSiteUrl || FALLBACK_URL,
  description: "Create and share your own cinematic opening crawl",
} as const;

/**
 * Generate absolute URL from a relative path
 */
function getAbsoluteUrl(path: string): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Generate WebApplication structured data
 */
export function getWebApplicationStructuredData() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Create cinematic opening crawl animations",
      "Customize text, colors, and speed",
      "Share via URL",
      "Privacy-focused",
      "Free and open-source",
    ],
    browserRequirements: "Requires JavaScript. Requires HTML5.",
  });
}

/**
 * Generate WebPage structured data
 */
function getWebPageStructuredData({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: getAbsoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  });
}

/**
 * Generate page metadata with defaults
 */
export function createMetadata({
  title,
  description,
  path = "/",
  ogImage,
  type = "website",
  structuredData,
}: {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  type?: "website" | "article";
  structuredData?: string;
}) {
  const url = getAbsoluteUrl(path);
  const imageUrl = ogImage
    ? getAbsoluteUrl(ogImage)
    : getAbsoluteUrl("/opengraph-image");

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    ...(structuredData && {
      other: {
        "application/ld+json": structuredData,
      },
    }),
  };
}

