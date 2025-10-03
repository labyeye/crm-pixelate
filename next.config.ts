import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // `serverExternalPackages` replaces the old experimental.serverComponentsExternalPackages
  // option in newer Next.js versions. Keep MongoDB server-only package externalized.
  serverExternalPackages: ['mongodb'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Use require here to avoid adding webpack to top-level imports (no extra deps required)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const webpack = require('webpack');

      // Fallback for Node.js modules that shouldn't run in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        child_process: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };

      // Alias problematic server-only packages to false so imports resolve to an empty module on the client
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        mongodb: false,
        'mongodb-client-encryption': false,
        '@mongodb-js/zstd': false,
      };

      // Ignore MongoDB's and Node core problematic modules on the client side
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(mongodb-client-encryption|child_process|worker_threads|perf_hooks|dns|fs|net|tls|timers\/promises|fs\/promises)$/,
        })
      );
    }

    // Exclude MongoDB's server-only modules
    config.externals = config.externals || [];
    config.externals.push({
      'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
      'aws4': 'commonjs aws4',
      'snappy': 'commonjs snappy',
      'kerberos': 'commonjs kerberos',
      '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
    });

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
