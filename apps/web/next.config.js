/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "event.moc.gov.tw" },
      { protocol: "https", hostname: "res.klook.com" },
    ],
  },
};

export default nextConfig;
