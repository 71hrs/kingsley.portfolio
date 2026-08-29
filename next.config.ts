import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Source pages stay server-side and are never copied into the public directory.
  outputFileTracingIncludes: {
    "/**": ["./Website Pages/**/*.html"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
