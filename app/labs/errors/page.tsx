"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/page-header";
import { LabSpecimen, type LogEntry } from "@/app/components/lab-specimen";
import { LabTrigger, LabTriggerSubmit } from "@/app/components/lab-trigger";
import { throwInAction } from "./actions";

class AppError extends Error {
  code: string;
  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AppError";
    this.code = code;
  }
}

export default function ErrorsLab() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [unhandledTick, setUnhandledTick] = useState(0);
  const [log, setLog] = useState<LogEntry | null>(null);

  if (shouldThrow) {
    throw new Error("Render-phase error: shouldThrow flag set");
  }

  useEffect(() => {
    if (unhandledTick === 0) return;
    void (async () => {
      throw new Error(`Unhandled rejection from useEffect tick=${unhandledTick}`);
    })();
  }, [unhandledTick]);

  return (
    <div className="cascade">
      <PageHeader
        number="01"
        total="06"
        path="/labs/errors"
        title="Errors"
        subtitle="A field guide to thrown exceptions and where each one is captured."
      />

      <LabSpecimen
        number="01"
        id="SPC-ERR-01"
        title="THROW IN ONCLICK"
        description="Synchronous error inside an event handler. React error boundaries don't catch this — surfaces via window.error and Sentry's global handler."
      >
        <LabTrigger
          lab="errors"
          specimen="SPC-ERR-01"
          onClickAction={() => {
            throw new Error("Client onClick error: button SPC-ERR-01");
          }}
        >
          TRIGGER
        </LabTrigger>
      </LabSpecimen>

      <LabSpecimen
        number="02"
        id="SPC-ERR-02"
        title="THROW DURING RENDER"
        description="Sets a state flag; the next render throws synchronously. The segment error boundary in app/error.tsx catches it."
      >
        <LabTrigger
          lab="errors"
          specimen="SPC-ERR-02"
          onClickAction={() => setShouldThrow(true)}
        >
          TRIGGER
        </LabTrigger>
      </LabSpecimen>

      <LabSpecimen
        number="03"
        id="SPC-ERR-03"
        title="USEEFFECT REJECTION"
        description="An async function inside useEffect rejects without try/catch — surfaces as an unhandled promise rejection."
      >
        <LabTrigger
          lab="errors"
          specimen="SPC-ERR-03"
          onClickAction={() => setUnhandledTick((t) => t + 1)}
        >
          TRIGGER
        </LabTrigger>
      </LabSpecimen>

      <LabSpecimen
        number="04"
        id="SPC-ERR-04"
        title="SERVER ACTION THROW"
        description="Form submits a Server Action that throws on the server. Round-trips back into app/error.tsx."
      >
        <form action={throwInAction}>
          <LabTriggerSubmit>TRIGGER</LabTriggerSubmit>
        </form>
      </LabSpecimen>

      <LabSpecimen
        number="05"
        id="SPC-ERR-05"
        title="ROUTE HANDLER 500"
        description="Calls /api/products?fail=1 and shows the error response. The 500 is a real server error trace."
        result={log?.id === "SPC-ERR-05" ? log.text : null}
        resultTone="err"
      >
        <LabTrigger
          lab="errors"
          specimen="SPC-ERR-05"
          onClickAction={async () => {
            const res = await fetch("/api/products?fail=1");
            const body = await res.json();
            setLog({
              id: "SPC-ERR-05",
              text: `status=${res.status}\nbody=${JSON.stringify(body, null, 2)}`,
              tone: "err",
            });
          }}
        >
          TRIGGER
        </LabTrigger>
      </LabSpecimen>

      <LabSpecimen
        number="06"
        id="SPC-ERR-06"
        title="TYPEERROR VARIANT"
        description="Calls a method on undefined. Different shape from the generic Error throw — useful for issue grouping."
      >
        <LabTrigger
          lab="errors"
          specimen="SPC-ERR-06"
          onClickAction={() => {
            const obj = undefined as unknown as { foo: () => void };
            obj.foo();
          }}
        >
          TRIGGER
        </LabTrigger>
      </LabSpecimen>

      <LabSpecimen
        number="07"
        id="SPC-ERR-07"
        title="CUSTOM APPERROR"
        description="Throws a named AppError subclass with a nested cause. Gives Seer a richer error tree to walk."
      >
        <LabTrigger
          lab="errors"
          specimen="SPC-ERR-07"
          onClickAction={() => {
            throw new AppError(
              "E_DISCOUNT_INVALID",
              "Discount BAD failed validation",
              {
                cause: new TypeError(
                  "Cannot read properties of undefined (reading 'percentage')",
                ),
              },
            );
          }}
        >
          TRIGGER
        </LabTrigger>
      </LabSpecimen>
    </div>
  );
}
