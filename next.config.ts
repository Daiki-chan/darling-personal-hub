import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{
      hostname: "**.ytimg.com",
      pathname: "/**",
      protocol: "https",
    }],
  },
};

export default nextConfig;
