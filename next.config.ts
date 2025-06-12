import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  images: {
    domains: [
      'jfapi.docbooked.com',
      'gotham-job-finder-app-bucket.s3.amazonaws.com',
      'gotham-job-finder-app-bucket.s3.us-east-2.amazonaws.com'
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;


