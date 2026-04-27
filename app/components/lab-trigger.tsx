"use client";

import { useFormStatus } from "react-dom";

type Props = {
  pending?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  type?: "button" | "submit";
};

export function LabTrigger({
  pending,
  disabled,
  children,
  type = "button",
}: Props) {
  return (
    <button type={type} disabled={pending || disabled} className="btn-trigger">
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
