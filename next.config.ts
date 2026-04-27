import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

// TODO: when @sentry/nextjs is wired in, wrap with withSentryConfig:
// import { withSentryConfig } from "@sentry/nextjs";
// export default withSentryConfig(nextConfig, { silent: !process.env.CI });
export default nextConfig;
