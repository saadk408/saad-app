import "server-only";

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
};

export type CartItem = { productId: string; qty: number };

export type Counters = { orders: number; errors: number; signups: number };

const products: Product[] = [
  {
    id: "SPC-001",
    name: "Acme Wireless Headphones",
    price: 129,
    description:
      "Studio-grade over-ears with 36-hour battery and active hush. Built to outlive deadlines.",
    category: "AUDIO",
  },
  {
    id: "SPC-002",
    name: "ErgoLite Standing Desk",
    price: 499,
    description:
      "Solid bamboo top on a quad-motor base. Memory presets remember your stretch breaks better than you do.",
    category: "FURNITURE",
  },
  {
    id: "SPC-003",
    name: "Coil Mechanical Keyboard",
    price: 189,
    description:
      "Hot-swap PCB, brass plate, custom Coil tactiles. Ships pre-lubed for that first thock.",
    category: "INPUT",
  },
  {
    id: "SPC-004",
    name: "Field Notebook Set",
    price: 24,
    description:
      "Three pocket-bound notebooks, dot grid throughout. The paper your napkin sketches deserve.",
    category: "PAPER",
  },
  {
    id: "SPC-005",
    name: "Atlas Travel Mug",
    price: 32,
    description:
      "Double-walled, vacuum-sealed, leak-tight. Holds 16oz at 140°F for six hours, no excuses.",
    category: "VESSEL",
  },
  {
    id: "SPC-006",
    name: "Lumen Desk Lamp",
    price: 89,
    description:
      "Aluminum arm, 2700K–6500K tunable, magnetic dimmer. Designed for late-night observability.",
    category: "LIGHT",
  },
];

let cart: CartItem[] = [];
const counters: Counters = { orders: 0, errors: 0, signups: 0 };

export function listProducts(): Product[] {
  return products;
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function addToCart(productId: string, qty: number): void {
  if (qty <= 0) return;
  if (!getProduct(productId)) {
    throw new Error(`Unknown productId: ${productId}`);
  }
  const existing = cart.find((c) => c.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, qty });
  }
}

export function setQty(productId: string, qty: number): void {
  if (qty < 0) {
    throw new Error("Quantity cannot be negative");
  }
  if (qty === 0) {
    cart = cart.filter((c) => c.productId !== productId);
    return;
  }
  const item = cart.find((c) => c.productId === productId);
  if (item) {
    item.qty = qty;
  } else {
    cart.push({ productId, qty });
  }
}

export function clearCart(): void {
  cart = [];
}

export function getCart(): CartItem[] {
  return cart.map((c) => ({ ...c }));
}

export function bumpCounter(key: keyof Counters): void {
  counters[key] += 1;
}

export function getCounters(): Counters {
  return { ...counters };
}
