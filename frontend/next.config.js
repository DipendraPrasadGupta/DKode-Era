/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost',   port: '5000', pathname: '/uploads/**' },
      { protocol: 'http',  hostname: '*.local',     port: '5000', pathname: '/uploads/**' },
      { protocol: 'http',  hostname: '192.168.**',              pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'dkodeera.com',            pathname: '/uploads/**' },
      { protocol: 'https', hostname: 'www.dkodeera.com',        pathname: '/uploads/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' }],
      },
      {
        source: '/robots.txt',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ];
  },
};

module.exports = nextConfig;
