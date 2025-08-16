/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async redirects() {
    return [
      // /viewer now serves the static Three.js page (no SSR)
      { source: '/viewer', destination: '/viewer.html', permanent: false }
    ]
  },
  webpack: (config, { isServer }) => {
    // Prevent Konva from trying to import the node 'canvas' module on SSR
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...(config.resolve.alias || {}), canvas: false }
    if (isServer) {
      config.externals = [ ...(config.externals || []), 'canvas' ]
    }
    return config
  }
}
export default nextConfig
