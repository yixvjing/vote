import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // 不使用 assetPrefix，在构建后通过脚本处理
};

export default nextConfig;
