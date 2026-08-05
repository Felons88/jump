import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Category, RentalItem } from "@/data/site";
import { rentalDayCount } from "@/lib/availability";

export type CartLine = {
  item: RentalItem;
  categorySlug: string;
  categoryName: string;
  eventDate: Date;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  eventDate: Date | undefined;
  pickupDate: Date | undefined;
  setEventDate: (d: Date | undefined) => void;
  setPickupDate: (d: Date | undefined) => void;
  setDateRange: (delivery: Date | undefined, pickup: Date | undefined) => void;
  rentalDays: number;
  addItem: (item: RentalItem, category: Category) => void;
  removeLine: (itemSlug: string) => void;
  updateQuantity: (itemSlug: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "jump-city-cart";

type PersistedCart = {
  lines: CartLine[];
  eventDate: string | undefined;
  pickupDate: string | undefined;
};

type LoadedCart = {
  lines: CartLine[];
  eventDate: Date | undefined;
  pickupDate: Date | undefined;
};

const EMPTY_CART: LoadedCart = { lines: [], eventDate: undefined, pickupDate: undefined };

function loadFromStorage(): LoadedCart {
  if (typeof window === "undefined") return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw) as PersistedCart;
    return {
      lines: parsed.lines.map((l) => ({ ...l, eventDate: new Date(l.eventDate) })),
      eventDate: parsed.eventDate ? new Date(parsed.eventDate) : undefined,
      pickupDate: parsed.pickupDate ? new Date(parsed.pickupDate) : undefined,
    };
  } catch {
    return EMPTY_CART;
  }
}

function saveToStorage(
  lines: CartLine[],
  eventDate: Date | undefined,
  pickupDate: Date | undefined,
) {
  if (typeof window === "undefined") return;
  const data: PersistedCart = {
    lines,
    eventDate: eventDate ? eventDate.toISOString() : undefined,
    pickupDate: pickupDate ? pickupDate.toISOString() : undefined,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [eventDate, setEventDateState] = useState<Date | undefined>();
  const [pickupDate, setPickupDateState] = useState<Date | undefined>();

  useEffect(() => {
    const saved = loadFromStorage();
    setLines(saved.lines);
    setEventDateState(saved.eventDate);
    setPickupDateState(saved.pickupDate);
  }, []);

  useEffect(() => {
    saveToStorage(lines, eventDate, pickupDate);
  }, [lines, eventDate, pickupDate]);

  const setEventDate = useCallback((d: Date | undefined) => {
    setEventDateState(d);
    setLines((prev) => prev.map((l) => (d ? { ...l, eventDate: d } : l)));
  }, []);

  const setPickupDate = useCallback((d: Date | undefined) => {
    setPickupDateState(d);
  }, []);

  const setDateRange = useCallback((delivery: Date | undefined, pickup: Date | undefined) => {
    setEventDateState(delivery);
    setPickupDateState(pickup);
    setLines((prev) => prev.map((l) => (delivery ? { ...l, eventDate: delivery } : l)));
  }, []);

  const addItem = useCallback(
    (item: RentalItem, category: Category) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.item.slug === item.slug);
        if (existing) {
          return prev.map((l) =>
            l.item.slug === item.slug ? { ...l, quantity: l.quantity + 1 } : l,
          );
        }
        return [
          ...prev,
          {
            item,
            categorySlug: category.slug,
            categoryName: category.name,
            eventDate: eventDate ?? new Date(),
            quantity: 1,
          },
        ];
      });
    },
    [eventDate],
  );

  const removeLine = useCallback((itemSlug: string) => {
    setLines((prev) => prev.filter((l) => l.item.slug !== itemSlug));
  }, []);

  const updateQuantity = useCallback((itemSlug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.item.slug !== itemSlug)
        : prev.map((l) => (l.item.slug === itemSlug ? { ...l, quantity: qty } : l)),
    );
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setEventDateState(undefined);
    setPickupDateState(undefined);
  }, []);

  const rentalDays = useMemo(
    () => (eventDate ? rentalDayCount(eventDate, pickupDate) : 1),
    [eventDate, pickupDate],
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.item.priceFrom * l.quantity, 0),
    [lines],
  );

  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      eventDate,
      pickupDate,
      setEventDate,
      setPickupDate,
      setDateRange,
      rentalDays,
      addItem,
      removeLine,
      updateQuantity,
      clear,
      subtotal,
      itemCount,
    }),
    [
      lines,
      eventDate,
      pickupDate,
      setEventDate,
      setPickupDate,
      setDateRange,
      rentalDays,
      addItem,
      removeLine,
      updateQuantity,
      clear,
      subtotal,
      itemCount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
