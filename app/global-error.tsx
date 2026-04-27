"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";


type ErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function GlobalError({ error, unstable_retry }: ErrorProps) {
    useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  
  return (
    <html lang="en">
      <body
        style={{
          background: "#f4eedf",
          color: "#0f0f0d",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          minHeight: "100vh",
          padding: "48px 24px",
          margin: 0,
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            border: "1px solid #e63946",
            background: "#ede5d2",
            padding: 24,
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "#7a7569",
            }}
          >
            SPC-ERR-FATAL
          </span>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#7a7569",
              margin: "0 0 12px",
            }}
          >
            ROOT BOUNDARY · CAPTURED
          </p>
          <h1
            style={{
              fontFamily: "ui-serif, Georgia, serif",
              fontSize: 48,
              lineHeight: 0.95,
              margin: "0 0 16px",
            }}
          >
            Application halted.
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#7a7569",
              margin: "0 0 20px",
              maxWidth: "55ch",
            }}
          >
            The root layout failed to render. The lab is offline until this
            specimen is recovered.
          </p>
          <pre
            style={{
              background: "#f4eedf",
              border: "1px solid #0f0f0d",
              padding: 12,
              fontSize: 12,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              marginBottom: 16,
            }}
          >
            {error.message || String(error)}
          </pre>
          {error.digest ? (
            <p
              style={{
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#7a7569",
                margin: "0 0 20px",
              }}
            >
              digest · {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={unstable_retry}
            style={{
              border: "1px solid #0f0f0d",
              background: "#f4eedf",
              fontFamily: "inherit",
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "10px 20px",
              cursor: "pointer",
              color: "#0f0f0d",
            }}
          >
            [ RETRY ]
          </button>
        </div>
      </body>
    </html>
  );
}
