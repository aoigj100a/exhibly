import type { NextConfig } from "next";
import { imageHosts } from "./lib/imageHosts";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};

export default nextConfig;
