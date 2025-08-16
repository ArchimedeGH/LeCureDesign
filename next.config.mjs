/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/viewer', destination: '/viewer.html', permanent: false }
    ]
  },
  webpack: (config, { isServer }) => {
    // Evita che konva cerchi il modulo 'canvas' lato server
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...(config.resolve.alias || {}), canvas: false }
    if (isServer) {
      config.externals = [ ...(config.externals || []), 'canvas' ]
    }
    return config
  }
}
export default nextConfig
