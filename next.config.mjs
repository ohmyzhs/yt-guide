/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["react-markdown", "remark-gfm"],
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
