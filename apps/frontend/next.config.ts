import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  ...(process.env.NEXT_NO_TURBOPACK !== '1' && {
    turbopack: {
      root: __dirname,
    },
  }),
};

export default nextConfig;
