import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "simple-icons",
      "@lobehub/icons",
    ],
  },
};

export default nextConfig;
