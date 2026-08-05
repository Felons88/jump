import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import type { BookingRequest } from "@/data/mockBookings";

export type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: Date;
  bookings: BookingRequest[];
  reviews: { itemSlug: string; rating: number; text: string; createdAt: Date }[];
  newsletterOptIn: boolean;
};

type AuthContextValue = {
  customer: Customer | null;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
  ) => { ok: boolean; error?: string };
  logIn: (email: string, password: string) => { ok: boolean; error?: string };
  logOut: () => void;
  updateProfile: (name: string, phone: string) => void;
  setNewsletterOptIn: (optIn: boolean) => void;
  addBookingToAccount: (booking: BookingRequest) => void;
  addReview: (itemSlug: string, rating: number, text: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "jump-city-auth";
const USERS_KEY = "jump-city-users";

/** Simple non-crypto hash for mock auth — NOT for production use. */
function mockHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `mock_${h}`;
}

type StoredUser = {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
  bookings: BookingRequest[];
  reviews: { itemSlug: string; rating: number; text: string; createdAt: string }[];
  newsletterOptIn: boolean;
};

function loadUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function storedToCustomer(s: StoredUser): Customer {
  return {
    ...s,
    createdAt: new Date(s.createdAt),
    bookings: s.bookings.map((b) => ({
      ...b,
      eventDate: new Date(b.eventDate),
      createdAt: new Date(b.createdAt),
    })),
    reviews: s.reviews.map((r) => ({ ...r, createdAt: new Date(r.createdAt) })),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const userId = raw;
      const users = loadUsers();
      const found = users.find((u) => u.id === userId);
      if (found) setCustomer(storedToCustomer(found));
    }
  }, []);

  const persistCustomer = useCallback((c: Customer | null) => {
    if (typeof window === "undefined") return;
    if (c) {
      window.localStorage.setItem(STORAGE_KEY, c.id);
      const users = loadUsers();
      const stored: StoredUser = {
        ...c,
        createdAt: c.createdAt.toISOString(),
        bookings: c.bookings,
        reviews: c.reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
      };
      const idx = users.findIndex((u) => u.id === c.id);
      if (idx >= 0) users[idx] = stored;
      else users.push(stored);
      saveUsers(users);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const signUp = useCallback(
    (
      email: string,
      password: string,
      name: string,
      phone: string,
    ): { ok: boolean; error?: string } => {
      const users = loadUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: "An account with this email already exists." };
      }
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      const newCustomer: Customer = {
        id,
        email,
        name,
        phone,
        passwordHash: mockHash(password),
        createdAt: new Date(),
        bookings: [],
        reviews: [],
        newsletterOptIn: true,
      };
      setCustomer(newCustomer);
      persistCustomer(newCustomer);
      return { ok: true };
    },
    [persistCustomer],
  );

  const logIn = useCallback(
    (email: string, password: string): { ok: boolean; error?: string } => {
      const users = loadUsers();
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) return { ok: false, error: "No account found with this email." };
      if (found.passwordHash !== mockHash(password))
        return { ok: false, error: "Incorrect password." };
      const c = storedToCustomer(found);
      setCustomer(c);
      persistCustomer(c);
      return { ok: true };
    },
    [persistCustomer],
  );

  const logOut = useCallback(() => {
    setCustomer(null);
    persistCustomer(null);
  }, [persistCustomer]);

  const updateProfile = useCallback(
    (name: string, phone: string) => {
      setCustomer((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, name, phone };
        persistCustomer(updated);
        return updated;
      });
    },
    [persistCustomer],
  );

  const setNewsletterOptIn = useCallback(
    (optIn: boolean) => {
      setCustomer((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, newsletterOptIn: optIn };
        persistCustomer(updated);
        return updated;
      });
    },
    [persistCustomer],
  );

  const addBookingToAccount = useCallback(
    (booking: BookingRequest) => {
      setCustomer((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, bookings: [...prev.bookings, booking] };
        persistCustomer(updated);
        return updated;
      });
    },
    [persistCustomer],
  );

  const addReview = useCallback(
    (itemSlug: string, rating: number, text: string) => {
      setCustomer((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          reviews: [...prev.reviews, { itemSlug, rating, text, createdAt: new Date() }],
        };
        persistCustomer(updated);
        return updated;
      });
    },
    [persistCustomer],
  );

  const value: AuthContextValue = {
    customer,
    signUp,
    logIn,
    logOut,
    updateProfile,
    setNewsletterOptIn,
    addBookingToAccount,
    addReview,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
