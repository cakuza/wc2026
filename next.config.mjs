/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Force the homepage HTML to revalidate so CDN/browser never serve a stale build.
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
