import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://starcrawler.vercel.app";

export const metadata: Metadata = {
  title: "Disclaimer - Star Crawler",
  description: "Trademark and copyright disclaimer for Star Crawler",
  openGraph: {
    title: "Disclaimer - Star Crawler",
    description: "Trademark and copyright disclaimer for Star Crawler",
    url: `${baseUrl}/disclaimer`,
  },
  twitter: {
    card: "summary",
    title: "Disclaimer - Star Crawler",
    description: "Trademark and copyright disclaimer for Star Crawler",
  },
};

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer">
      <p className="text-gray-300">
        <strong>Last Updated:</strong> January 1, 2026
      </p>

      <h2>We're Not Connected to Star Wars</h2>
      <p>
        <strong>
          Star Crawler is not affiliated with, endorsed by, or connected to
          Lucasfilm Ltd., The Walt Disney Company, or any Star Wars franchise.
        </strong>
      </p>
      <p>
        This is just a free, open-source personal fan project licensed under the
        MIT License that we made because we like Star Wars opening crawls. This
        is not an official product.
      </p>

      <h2>About Star Wars</h2>
      <p>
        Star Wars, including all characters, names, logos, and everything else
        related to it, is a trademark of Lucasfilm Ltd. We're using the style
        under fair use principles for entertainment and parody purposes only.
      </p>

      <h2>Fonts and Styling</h2>
      <p>
        Star Crawler uses fonts and styling inspired by Star Wars. This is just
        for the look and feel—it doesn't mean we're connected to Star Wars or
        that Lucasfilm/Disney endorses this project.
      </p>

      <h2>Your Content Is Your Responsibility</h2>
      <p>
        When you create crawls using Star Crawler, you're responsible for what
        you make. Make sure your content:
      </p>
      <ul>
        <li>Doesn't violate Star Wars copyrights or trademarks</li>
        <li>Doesn't claim to be official Star Wars content</li>
        <li>Follows all laws</li>
        <li>Follows our Terms of Service</li>
      </ul>
      <p>
        We don't endorse or take responsibility for what users create. That's on
        you.
      </p>

      <h2>Fair Use</h2>
      <p>
        Star Crawler operates under fair use principles. We're providing a tool
        for you to create your own original content, not reproducing or
        distributing Star Wars material. The style is inspired by Star Wars, but
        the content you create is yours.
      </p>

      <h2>No Endorsement</h2>
      <p>
        Using Star Wars-inspired fonts, colors, or styling doesn't mean
        Lucasfilm or Disney endorses this project or is connected to it. Any
        similarity is purely for style and entertainment.
      </p>

      <h2>Copyright and Intellectual Property</h2>
      <p>
        Star Crawler does not host or store user-created content. All crawl
        content exists only in URLs that users create and share. Since we do not
        store content on our servers, traditional DMCA takedown procedures do
        not apply to Star Crawler itself.
      </p>
      <p>
        However, we respect intellectual property rights. If you create content
        using Star Crawler that infringes someone else's copyright, you are
        responsible for that content. The content creator—not Star Crawler—is
        liable for any copyright infringement in the content they create and
        share.
      </p>
      <p>
        If you believe someone is using Star Crawler to create content that
        infringes your copyright, you should contact the person sharing that
        content directly, as Star Crawler does not control or store the content.
      </p>

      <h2>No Guarantees</h2>
      <p>
        Star Crawler is provided "as is." We don't guarantee it works perfectly,
        is accurate, or is useful for any particular purpose. Use it at your own
        risk.
      </p>

      <h2>Third-Party Services</h2>
      <p>
        The "Share" button copies the crawl URL to your clipboard. If you share
        it elsewhere, you're using those services. We're not responsible for
        other platforms or their policies.
      </p>

      <h2>We're Not Liable</h2>
      <p>
        We're not responsible for any problems that come from using Star
        Crawler, including issues with copyright, trademarks, or anything else.
      </p>

      <h2>Questions About This Disclaimer</h2>
      <p>
        This disclaimer explains that Star Crawler is an independent fan project
        not affiliated with Star Wars. If you have questions about how Star
        Crawler works, you can review the{" "}
        <Link href="/" className="text-crawl-yellow hover:underline">
          homepage
        </Link>{" "}
        for more information.
      </p>
    </LegalLayout>
  );
}
