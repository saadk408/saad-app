// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4b574466876042e8ca72b9bf9e4128f6@o4511277349273601.ingest.us.sentry.io/4511293738188800",

  // 100% in development, 10% in production. Use tracesSampler for finer control.
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
