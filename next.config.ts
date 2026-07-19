import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chaise.app",
        pathname: "/assets/images/**",
      },
    ],
  },
};

export default nextConfig;
