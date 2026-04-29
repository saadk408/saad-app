import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

// TODO: once @sentry/nextjs is installed, wrap with withSentryConfig:
//   import { withSentryConfig } from "@sentry/nextjs";
//   export default withSentryConfig(nextConfig, {
//     org: "<your-org>",
//     project: "<your-project>",
//     authToken: process.env.SENTRY_AUTH_TOKEN,
//     silent: !process.env.CI,
//     widenClientFileUpload: true,
//     tunnelRoute: "/sentry-tunnel",
//     // Source-map upload + auto-delete are the default in v9+; no
//     // setCommits block needed.
//   });
export default nextConfig;
