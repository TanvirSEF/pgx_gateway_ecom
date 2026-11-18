import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.pgxdigital.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pgxdigital.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.pgxmarketplace.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pgxmarketplace.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gadgetbd.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "traqtwdfhxduijhqsuwg.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.pgxsports.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pgxsports.shop",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.pgxsports.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pgxsports.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
