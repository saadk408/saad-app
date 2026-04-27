import { listProducts } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("fail") === "1") {
    return Response.json(
      { error: "forced failure", code: "PRODUCTS_FAIL_FLAG" },
      { status: 500 },
    );
  }
  return Response.json({ products: listProducts() });
}
