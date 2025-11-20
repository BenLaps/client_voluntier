import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Updated devIndicators block
  devIndicators: {
    // Removed buildActivity as it's deprecated
    position: 'bottom-right', // Renamed from buildActivityPosition
  },

  // Ensure allowedDevOrigins is at the top level
  allowedDevOrigins: ["http://192.168.0.205:3000"], 

};

export default nextConfig;