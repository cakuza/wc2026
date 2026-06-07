/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "flagcdn.com" }]
  },
  async redirects() {
    return [
      {
        source: "/today",
        destination: "/",
        permanent: false
      }
    ];
  }
};

module.exports = nextConfig;
