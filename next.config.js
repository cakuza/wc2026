/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "flagcdn.com" }]
  },
  async redirects() {
    return [
      {
        source: "/matches",
        destination: "/schedule",
        permanent: true
      },
      {
        source: "/standings",
        destination: "/groups",
        permanent: true
      },
      {
        source: "/world-cup-quiz",
        destination: "/quiz",
        permanent: true
      },
      {
        source: "/privacy-policy",
        destination: "/privacy",
        permanent: true
      },
      {
        source: "/cards",
        destination: "/teams",
        permanent: true
      },
      // Abbreviated group letter URLs (/groups/a → /groups/group-a).
      // These were previously served by a catch-all that sent /groups/:group → /groups.
      // Now that the canonical group pages exist, redirect the short form to the real page.
      ...["a","b","c","d","e","f","g","h","i","j","k","l"].map((letter) => ({
        source: `/groups/${letter}`,
        destination: `/groups/group-${letter}`,
        permanent: true,
      })),
      {
        source: "/teams/:slug(.*)-world-cup-schedule",
        destination: "/teams/:slug",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
