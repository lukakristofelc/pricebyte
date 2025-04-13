/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['mercatoronline.si', "cdn1.interspar.at"],
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:3001/:path*', // Adjust to your backend URL
      },
    ];
  },
};

export default nextConfig;