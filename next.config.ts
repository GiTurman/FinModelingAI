// next.config.ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_APP_NAME: 'FM Georgia',
    NEXT_PUBLIC_VERSION: '1.0.0',
  },
}
export default nextConfig
