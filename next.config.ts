import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

// TODO: once @sentry/nextjs is installed, wrap with withSentryConfig:
//   import { withSentryConfig } from "@sentry/nextjs";
//   export default withSentryConfig(nextConfig, {
//     org: "<your-org>",
//     project: "<your-project>",
//     silent: !process.env.CI,
//     widenClientFileUpload: true,
//     tunnelRoute: "/monitoring",
//     release: { setCommits: { auto: true } },
//   });
export default nextConfig;
