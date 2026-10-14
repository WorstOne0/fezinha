/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits .next/standalone with only the files needed at runtime, so the Docker image ships a trimmed node_modules.
  output: "standalone",
};

export default nextConfig;
