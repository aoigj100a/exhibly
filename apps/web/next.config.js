/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "event.moc.gov.tw" },
      { protocol: "https", hostname: "res.klook.com" },
      { protocol: "https", hostname: "imgs2.utiki.com.tw" },
    ],
  },
};

export default nextConfig;
