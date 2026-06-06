/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Redireciona o domínio Vercel para o domínio principal (com www)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'sgcseuguiadecompras.vercel.app' }],
        destination: 'https://www.sgcseuguiadecompras.com.br/:path*',
        permanent: true,
      },
      // Redireciona o domínio sem www para o domínio com www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'sgcseuguiadecompras.com.br' }],
        destination: 'https://www.sgcseuguiadecompras.com.br/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
