import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生产环境优化
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  // 允许较大的请求体（上传图片用）
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
