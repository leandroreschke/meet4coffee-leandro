import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  transpilePackages: [
    "@meet4coffee/core",
    "@meet4coffee/i18n",
    "@meet4coffee/supabase",
  ],
};

export default nextConfig;
