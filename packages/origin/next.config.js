/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SCSS
  sassOptions: {
    includePaths: ['./src/tokens'],
  },
};

export default nextConfig;

