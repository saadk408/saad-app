// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4b574466876042e8ca72b9bf9e4128f6@o4511277349273601.ingest.us.sentry.io/4511293738188800",

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // 100% in development and production. Use tracesSampler for finer control.
  tracesSampleRate: 1.0,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 1.0,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Enable the SDK's default data scrubbing by withholding user PII
  // (IP, request headers, cookies, request body). Flip to true to send PII.
  // Note: since @sentry/nextjs v10.4.0, browser user IP inference is also
  // gated on this flag.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
