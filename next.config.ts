import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        hostname: "**.ytimg.com",
        pathname: "/**",
        protocol: "https",
      },
      {
        hostname: "res.cloudinary.com",
        pathname: "/**",
        protocol: "https",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/am-nhac",
        destination: "/music",
        permanent: true,
      },
      {
        source: "/thu-vien",
        destination: "/memories",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
