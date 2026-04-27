export async function register() {
  // TODO: Sentry init goes here once @sentry/nextjs is installed.
  // if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  // if (process.env.NEXT_RUNTIME === "edge")   await import("./sentry.edge.config");
}

// TODO: when @sentry/nextjs is wired in, surface server-side request errors:
// import * as Sentry from "@sentry/nextjs";
// export const onRequestError = Sentry.captureRequestError;
