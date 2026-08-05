export type PromoCode = {
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  expiresAt: Date | null;
  active: boolean;
};

export const promoCodes: PromoCode[] = [
  {
    code: "SUMMER10",
    description: "10% off any summer party booking",
    type: "percent",
    value: 10,
    minOrder: 0,
    expiresAt: new Date("2026-09-30"),
    active: true,
  },
  {
    code: "JUMPCITY25",
    description: "$25 off orders over $200",
    type: "flat",
    value: 25,
    minOrder: 200,
    expiresAt: new Date("2026-12-31"),
    active: true,
  },
  {
    code: "WEEKEND15",
    description: "15% off weekend rentals",
    type: "percent",
    value: 15,
    minOrder: 150,
    expiresAt: new Date("2026-12-31"),
    active: true,
  },
  {
    code: "FREESHIP",
    description: "Free delivery on any order",
    type: "flat",
    value: 49,
    minOrder: 0,
    expiresAt: new Date("2026-08-31"),
    active: false,
  },
  {
    code: "BOUNCE5",
    description: "$5 off any bounce house rental",
    type: "flat",
    value: 5,
    minOrder: 0,
    expiresAt: new Date("2026-12-31"),
    active: true,
  },
  {
    code: "PARTY50",
    description: "$50 off orders over $500",
    type: "flat",
    value: 50,
    minOrder: 500,
    expiresAt: new Date("2026-12-31"),
    active: true,
  },
  {
    code: "MIDWEEK20",
    description: "20% off weekday rentals",
    type: "percent",
    value: 20,
    minOrder: 100,
    expiresAt: new Date("2026-12-31"),
    active: true,
  },
];

export type PromoResult = {
  ok: boolean;
  error?: string;
  discount: number;
  code?: PromoCode;
};

export function validatePromoCode(code: string, subtotal: number): PromoResult {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { ok: false, discount: 0 };

  const promo = promoCodes.find((p) => p.code === trimmed);
  if (!promo) return { ok: false, error: "Invalid promo code.", discount: 0 };
  if (!promo.active)
    return { ok: false, error: "This promo code is no longer active.", discount: 0 };
  if (promo.expiresAt && promo.expiresAt < new Date())
    return { ok: false, error: "This promo code has expired.", discount: 0 };
  if (subtotal < promo.minOrder)
    return {
      ok: false,
      error: `This code requires a minimum order of $${promo.minOrder}.`,
      discount: 0,
    };

  const discount =
    promo.type === "percent"
      ? Math.round(((subtotal * promo.value) / 100) * 100) / 100
      : promo.value;

  return { ok: true, discount, code: promo };
}
