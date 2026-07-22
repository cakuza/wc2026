if (!process.env.NODE_OPTIONS || !process.env.NODE_OPTIONS.includes("--max-old-space-size")) {
  process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ""} --max-old-space-size=8192`.trim();
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "flagcdn.com" }]
  },
  outputFileTracingIncludes: {
    "/*": ["./data/archive/**/*"]
  },
  experimental: {
    workerThreads: false,
    cpus: 1
  }
};

module.exports = nextConfig;
