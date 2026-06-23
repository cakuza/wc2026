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
      {
        source: "/teams/:slug(.*)-world-cup-schedule",
        destination: "/teams/:slug",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
