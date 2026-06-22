import type { MetadataRoute } from "next";

// AI-crawler policy decisions:
// - OAI-SearchBot: search-index agent for ChatGPT search — allowed (search visibility).
// - GPTBot: OpenAI model-training crawler — currently allowed by default (no explicit policy set).
//   To opt out of model training while keeping search visibility, add a separate disallow rule
//   for GPTBot. This decision belongs to the site owner; no change is made here without
//   explicit instruction.
// - Bingbot / Googlebot: full access.

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
    ],
    sitemap: "https://www.worldcupmatchday.com/sitemap.xml",
  };
}
