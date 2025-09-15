import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  basePath: '/vote-book',
  assetPrefix: 'https://static.thefair.net.cn/activity/vote-book',
  images: {
    unoptimized: true
  },
};

export default nextConfig;
