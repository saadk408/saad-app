"use client";

import { useFormStatus } from "react-dom";

type Props = {
  pending?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  type?: "button" | "submit";
  lab?: string;
  specimen?: string;
  // Suffixed `Action` to satisfy Next.js 16's `use client` serialization rule
  // (functions on client-component prop boundaries must be Server Actions or
  // named *Action). This is a regular client-side handler, not a Server Action.
  onClickAction?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

export function LabTrigger({
  pending,
  disabled,
  children,
  type = "button",
  lab,
  specimen,
  onClickAction,
}: Props) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: emit a Sentry client metric here, e.g.
    //   if (lab && specimen) {
    //     Sentry.metrics.count("lab_trigger", 1, {
    //       attributes: { lab, specimen, runtime: "client" },
    //     });
    //   }
    void lab;
    void specimen;
    onClickAction?.(event);
  };

  return (
    <button
      type={type}
      disabled={pending || disabled}
      className="btn-trigger"
      onClick={handleClick}
    >
      <span className="btn-trigger-label">
        [ {children}
        {pending ? " …" : ""} ]
      </span>
    </button>
  );
}

export function LabTriggerSubmit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <LabTrigger type="submit" pending={pending}>
      {children}
    </LabTrigger>
  );
}
