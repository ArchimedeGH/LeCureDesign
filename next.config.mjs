/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Prevent Konva from trying to resolve the node 'canvas' module
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...(config.resolve.alias || {}), canvas: false }
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas']
    }
    return config
  }
}
export default nextConfig
