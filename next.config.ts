import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper SSR handling for react-email-editor
  transpilePackages: ["react-email-editor"],

  // Optimize for client-side components
  experimental: {
    optimizePackageImports: ["react-email-editor"],
  },

  images: {
    domains: [
      "jfapi.docbooked.com",
      "gotham-job-finder-app-bucket.s3.amazonaws.com",
      "gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com",
      "gotham-job-finder.s3.amazonaws.com",
      "gotham-job-finder.s3.us-east-2.amazonaws.com",
      // Add domains for email template assets
      "assets.unlayer.com",
      "via.placeholder.com",
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Handle react-email-editor properly in webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },
};

export default nextConfig;
