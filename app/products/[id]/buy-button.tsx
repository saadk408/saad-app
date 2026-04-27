"use client";

import { useFormStatus } from "react-dom";
import { addItem } from "@/app/cart/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-action">
      {pending ? "ADDING …" : "ADD TO SPECIMEN CART"}
    </button>
  );
}

export function BuyButton({ productId }: { productId: string }) {
  return (
    <form action={addItem} className="flex items-center gap-4">
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton />
    </form>
  );
}
