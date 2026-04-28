// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://4b574466876042e8ca72b9bf9e4128f6@o4511277349273601.ingest.us.sentry.io/4511293738188800",

  // 100% in both dev and prod: this is a Sentry test lab and we want every transaction captured.
  tracesSampleRate: 1.0,

  // Attach local variable values to server stack frames for richer debugging.
  includeLocalVariables: true,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable the SDK's default data scrubbing by withholding user PII
  // (IP, request headers, cookies, request body). Flip to true to send PII.
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
});
