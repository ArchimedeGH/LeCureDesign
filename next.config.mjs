/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Evita che konva/React-Konva risolvano il modulo 'canvas' (solo Node)
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false
    };
    if (isServer) {
      // non tentare di includere 'canvas' nel bundle server
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  }
}
export default nextConfig
