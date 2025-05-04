/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configure the base path for GitHub Pages deployment
  // This should match the repository name
  basePath: process.env.GITHUB_ACTIONS ? '/padel' : '',
  // Disable image optimization since it's not supported in static exports
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
