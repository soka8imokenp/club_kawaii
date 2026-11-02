import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lokal tarmoqdagi telefondan (192.168.x.x) ishlab chiqish serverini ochish uchun
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*", "*.local"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',

      },
    ],
  },
};

export default nextConfig;
