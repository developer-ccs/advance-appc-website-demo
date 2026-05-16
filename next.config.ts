import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["*", "192.168.0.119"],
  turbopack: {
    resolveAlias: {
      "next/dist/build/polyfills/polyfill-module":
        "./src/lib/empty-polyfill.ts",
    },
  },
  images: {
    remotePatterns: [
      // Dev backend
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/images/**",
      },
      // LAN dev (for your 192.168.x.x device testing)
      {
        protocol: "http",
        hostname: "192.168.0.126",
        port: "8000",
        pathname: "/images/**",
      },
      // Production
      {
        protocol: "https",
        hostname: "development.appharmacycouncil.com",
      },
      {
        protocol: "https",
        hostname: "appharmacycouncil.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [50, 60, 75],
    deviceSizes: [640, 750, 828, 1080, 1280, 1920, 2048, 3840],
  },
};
export default nextConfig;
