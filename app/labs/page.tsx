import { PageHeader } from "@/app/components/page-header";
import { SpecimenCard } from "@/app/components/specimen-card";

const labs = [
  {
    id: "SPC-EXP-01",
    title: "Errors",
    description:
      "Throw in event handlers, render, useEffect, Server Actions, and route handlers.",
    href: "/labs/errors",
  },
  {
    id: "SPC-EXP-02",
    title: "Tracing",
    description:
      "Sequential, parallel, and slow-Server-Action fetches that show up as spans.",
    href: "/labs/tracing",
  },
  {
    id: "SPC-EXP-03",
    title: "Logs",
    description:
      "Client and server console output with structured fields, ready for the Sentry logger.",
    href: "/labs/logs",
  },
  {
    id: "SPC-EXP-04",
    title: "Seer",
    description:
      "Buggy checkout with a deep, well-named call chain — chum for the AI debugger.",
    href: "/labs/seer",
  },
  {
    id: "SPC-EXP-05",
    title: "Feedback",
    description:
      "Anchor for the Sentry feedback widget; lights up once feedbackIntegration is enabled.",
    href: "/labs/feedback",
  },
  {
    id: "SPC-EXP-06",
    title: "Metrics",
    description:
      "Counters, gauges, and distributions for cross-cutting telemetry.",
    href: "/labs/metrics",
  },
];

export default function LabsIndex() {
  return (
    <div className="cascade">
      <PageHeader
        number="05"
        total="06"
        path="/labs"
        title="Labs"
        subtitle="A field guide to triggering Sentry. Each scenario is one click away from a captured event."
      />
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {labs.map((lab) => (
          <li key={lab.id}>
            <SpecimenCard {...lab} />
          </li>
        ))}
      </ul>
    </div>
  );
}
