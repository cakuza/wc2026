/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "flagcdn.com" }]
  },
  outputFileTracingIncludes: {
    "/*": ["./data/archive/**/*"]
  }
};

module.exports = nextConfig;
