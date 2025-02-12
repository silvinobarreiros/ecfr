import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Create __filename and __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // transpilePackages: ['@repo/ui'], // Uncomment this line to transpile the @repo/ui package
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: join(__dirname, '../../'),
  },
  images: {
    // or if you're using data URIs
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
