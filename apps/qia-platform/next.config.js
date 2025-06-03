/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 开发环境不需要 basePath
  basePath: process.env.NODE_ENV === 'production' ? '/platform' : '',
  distDir: '.next',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/_next/:path*',
        destination: '/_next/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 