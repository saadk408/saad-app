"use server";

function validateInput(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("validateInput: payload missing");
  }
  return payload as { code: string };
}

function applyDiscount(input: { code: string }) {
  if (input.code === "BAD") {
    const cause = new TypeError("discount table lookup returned undefined");
    throw new Error("applyDiscount: code BAD is invalid", { cause });
  }
  return 0.1;
}

export async function throwInAction(): Promise<void> {
  const input = validateInput({ code: "BAD" });
  applyDiscount(input);
}
