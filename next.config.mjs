/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      '@ratio1/cstore-auth-ts',
      '@node-rs/argon2',
      '@node-rs/argon2-linux-x64-gnu',
      '@node-rs/argon2-linux-x64-musl',
      '@node-rs/argon2-linux-arm64-gnu',
      '@node-rs/argon2-linux-arm64-musl',
      '@node-rs/argon2-win32-x64-msvc',
      '@node-rs/argon2-darwin-arm64',
      '@node-rs/argon2-darwin-x64'
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(
        '@node-rs/argon2',
        '@node-rs/argon2-linux-x64-gnu',
        '@node-rs/argon2-linux-x64-musl',
        '@node-rs/argon2-linux-arm64-gnu',
        '@node-rs/argon2-linux-arm64-musl',
        '@node-rs/argon2-win32-x64-msvc',
        '@node-rs/argon2-darwin-arm64',
        '@node-rs/argon2-darwin-x64'
      );
    }

    return config;
  }
};

export default nextConfig;
