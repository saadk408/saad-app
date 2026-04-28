import { PageHeader } from "@/app/components/page-header";

export default function FeedbackLab() {
  return (
    <div className="cascade max-w-3xl">
      <PageHeader
        number="05"
        total="06"
        path="/labs/feedback"
        title="Feedback"
        subtitle="Anchor for Sentry's feedback widget. Mounts globally once feedbackIntegration is enabled."
      />

      <div className="border border-[var(--color-ink)] p-6 mb-6">
        <p className="text-[11px] tracking-[0.18em] uppercase text-[var(--color-mute)] mb-3">
          SPC-FBK-01 &middot; WIDGET ANCHOR
        </p>
        <h2 className="font-display text-3xl mb-4">Awaiting integration.</h2>
        <p className="font-display italic text-[var(--color-mute)] mb-6 max-w-[60ch]">
          Once <code>Sentry.feedbackIntegration()</code> is added to the client init,
          a floating widget mounts automatically. This page documents where to point
          users and confirms the integration loaded.
        </p>
        <div
          id="feedback-anchor"
          className="border border-dashed p-12 text-center text-[12px] tracking-[0.18em] uppercase text-[var(--color-mute)]"
          style={{ borderColor: "var(--color-mute)" }}
        >
          # feedback-anchor
        </div>
      </div>

      <pre className="panel-soft text-[11px] overflow-auto whitespace-pre p-4 mb-6">
        {`// sentry.client.config.ts (after wizard runs)
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "system",
      autoInject: true,
    }),
  ],
});`}
      </pre>

      <p className="font-mono text-[11px] text-[var(--color-mute)]">
        TODO: enable feedbackIntegration once @sentry/nextjs is installed (see /docs §10).
      </p>
    </div>
  );
}
