import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // Legacy HTML stays server-side. These files are traced into the deployment
  // function but are never copied into the public directory.
  outputFileTracingIncludes: {
    "/**": ["./legacy-pages/**/*.html", "./private-content/**/*.html", "./lib/auth/**/*.html"],
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
