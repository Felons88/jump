import { useSyncExternalStore } from "react";
import { differenceInDays, subDays, subMonths } from "date-fns";

import { categories } from "@/data/site";
import type { Category, RentalItem } from "@/data/site";
import type { DeliveryWindow } from "@/data/mockBookings";
import { promoCodes as basePromoCodes } from "@/data/promoCodes";
import type {
  ActivityEntityType,
  ActivityEntry,
  AdminBooking,
  AdminBookingStatus,
  AdminCustomer,
  AdminInventoryItem,
  AdminPromoCode,
  AdminSettings,
  AdminState,
  Campaign,
  CustomerMetrics,
  CustomerNote,
  CustomerTag,
  EmailMessage,
  EmailRecipient,
  InventoryStatus,
  MaintenanceEntry,
  PaymentStatus,
  SegmentKey,
} from "@/data/adminTypes";

const STORAGE_KEY = "jump-city-admin-store-v1";
const ACTOR = "Admin";

export function newId(prefix: string): string {
  const rand =
    typeof globalThis !== "undefined" && "crypto" in globalThis && globalThis.crypto.randomUUID
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}`;
}

/* ── Defaults ───────────────────────────────────────────────────────── */

const DEFAULT_SETTINGS: AdminSettings = {
  businessName: "Jump City Inflatable Rentals",
  contactEmail: "hello@jumpcityinflatablerentals.com",
  contactPhone: "(763) 555-0100",
  addressLine: "4210 Industrial Blvd, Minneapolis, MN 55421",
  taxRate: 7.375,
  depositPercent: 50,
  freeDeliveryThreshold: 175,
  standardDeliveryFee: 49,
  emailSenderName: "Jump City Rentals",
  emailSignature: "— The Jump City Team\n(763) 555-0100",
  notifyOnNewBooking: true,
  notifyOnCancellation: true,
  autoSendInvoice: false,
};

/* ── Seeding ────────────────────────────────────────────────────────── */

const FIRST_NAMES = [
  "Sarah",
  "Mike",
  "Jessica",
  "Tyler",
  "Ashley",
  "Brandon",
  "Emily",
  "Jake",
  "Nicole",
  "Derek",
  "Katie",
  "Marcus",
  "Lauren",
  "Zach",
  "Rachel",
  "Priya",
  "Andre",
  "Monica",
  "Devin",
  "Hannah",
];
const LAST_NAMES = [
  "Johnson",
  "Anderson",
  "Thompson",
  "Peterson",
  "Nelson",
  "Carlson",
  "Olson",
  "Berg",
  "Larson",
  "Hanson",
  "Williams",
  "Davis",
  "Miller",
  "Brown",
  "Wilson",
  "Patel",
  "Nguyen",
  "Rivera",
  "Okafor",
  "Schmidt",
];
const CITIES = [
  "Minneapolis",
  "St. Paul",
  "Bloomington",
  "Maple Grove",
  "Woodbury",
  "Eagan",
  "Edina",
  "Plymouth",
  "Blaine",
  "Coon Rapids",
  "Lakeville",
  "Burnsville",
];
const STREETS = [
  "123 Maple St",
  "456 Oak Ave",
  "789 Cedar Ln",
  "321 Birch Dr",
  "654 Pine Rd",
  "987 Elm Ct",
  "147 Spruce Way",
  "258 Willow Blvd",
  "369 Aspen Cir",
  "741 Cherry St",
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[Math.abs(i) % arr.length]!;
}

function flattenCatalog(): { item: RentalItem; category: Category }[] {
  const out: { item: RentalItem; category: Category }[] = [];
  for (const cat of categories) {
    for (const item of cat.items) out.push({ item, category: cat });
  }
  return out;
}

function seedState(): AdminState {
  const catalog = flattenCatalog();
  const windows: DeliveryWindow[] = [
    "Standard Delivery",
    "Event Day Delivery",
    "1-Hour Window Delivery",
  ];

  const customers: AdminCustomer[] = [];
  const bookings: AdminBooking[] = [];
  const now = new Date();

  for (let i = 0; i < 28; i++) {
    const first = pick(FIRST_NAMES, i);
    const last = pick(LAST_NAMES, i * 3 + 1);
    const customerId = `cust_seed_${i}`;
    const city = pick(CITIES, i);
    const street = pick(STREETS, i);
    const createdAt = subMonths(now, (i % 10) + 1);

    const bookingCount = i % 5 === 0 ? 0 : (i % 4) + 1;
    for (let b = 0; b < bookingCount; b++) {
      const { item, category } = pick(catalog, i * 7 + b * 3);
      const eventDate = subDays(now, ((i * 11 + b * 23) % 200) - 20);
      const subtotal = item.priceFrom;
      const deliveryFee = subtotal >= 175 ? 0 : 49;
      const discount = (i + b) % 6 === 0 ? 25 : 0;
      const taxable = subtotal - discount + deliveryFee;
      const tax = Math.round(taxable * 0.07375 * 100) / 100;
      const total = Math.round((taxable + tax) * 100) / 100;
      const deposit = Math.round(total * 0.5 * 100) / 100;

      const isPast = eventDate < now;
      const cancelled = (i * 13 + b) % 17 === 0;
      const status: AdminBookingStatus = cancelled
        ? "cancelled"
        : isPast
          ? "completed"
          : b === 0 && i % 3 === 0
            ? "open"
            : i % 2 === 0
              ? "confirmed"
              : "sent";
      const paymentStatus: PaymentStatus = cancelled
        ? "refunded"
        : status === "completed"
          ? "paid-in-full"
          : status === "open"
            ? "unpaid"
            : "deposit-paid";

      bookings.push({
        id: `bk_seed_${i}_${b}`,
        customerId,
        item,
        category,
        eventDate,
        deliveryWindow: pick(windows, i + b),
        address: { street, city, state: "MN", zip: `554${String(10 + ((i + b) % 80))}` },
        instructions: (i + b) % 5 === 0 ? "Backyard setup — gate code 1234." : "",
        subtotal,
        deliveryFee,
        discount,
        promoCode: discount > 0 ? "JUMPCITY25" : null,
        tax,
        total,
        deposit,
        balance: Math.round((total - deposit) * 100) / 100,
        status,
        paymentStatus,
        createdAt: subDays(eventDate, 9),
        updatedAt: subDays(eventDate, 2),
      });
    }

    const tags: CustomerTag[] = [];
    if (bookingCount >= 3) tags.push("vip");
    if (bookingCount >= 2) tags.push("repeat");
    if (bookingCount === 0) tags.push("new");
    if (i % 7 === 0) tags.push("corporate");

    customers.push({
      id: customerId,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      phone: `(763) 555-${String(1000 + i * 7).slice(-4)}`,
      address: { street, city, state: "MN", zip: `554${String(10 + (i % 80))}` },
      createdAt,
      newsletterOptIn: i % 4 !== 0,
      tags,
      notes:
        i % 6 === 0
          ? [
              {
                id: newId("note"),
                body: "Prefers morning delivery. Repeat birthday-party customer.",
                author: ACTOR,
                createdAt: subMonths(now, 1),
              },
            ]
          : [],
      archived: false,
    });
  }

  const inventory: AdminInventoryItem[] = catalog.map(({ item, category }, idx) => {
    const roll = (item.slug.charCodeAt(0) + idx) % 12;
    const status: InventoryStatus =
      roll === 0
        ? "damaged"
        : roll === 1
          ? "out-for-cleaning"
          : roll === 2
            ? "reserved"
            : "available";
    return {
      id: `inv_${item.slug}`,
      name: item.name,
      slug: item.slug,
      categorySlug: category.slug,
      image: item.image,
      alt: item.alt,
      priceFrom: item.priceFrom,
      status,
      timesRented: 4 + ((item.slug.charCodeAt(0) + idx * 3) % 26),
      purchasePrice: Math.round(item.priceFrom * 9.5),
      purchasedAt: subMonths(new Date(), 6 + (idx % 30)),
      condition: (roll === 0 ? 2 : roll === 1 ? 3 : (idx % 2) + 4) as 1 | 2 | 3 | 4 | 5,
      maintenance:
        roll === 0
          ? [
              {
                id: newId("mnt"),
                at: subDays(new Date(), 6),
                type: "repair" as const,
                note: "Seam tear on the left wall — patch scheduled.",
                cost: 120,
                performedBy: "Carlos R.",
              },
            ]
          : [],
      notes: "",
    };
  });

  const promos: AdminPromoCode[] = basePromoCodes.map((p, i) => ({
    id: `promo_${p.code}`,
    code: p.code,
    description: p.description,
    type: p.type,
    value: p.value,
    minOrder: p.minOrder,
    expiresAt: p.expiresAt,
    active: p.active,
    usageCount: (i * 7) % 23,
    usageLimit: i % 3 === 0 ? 100 : null,
    createdAt: subMonths(new Date(), 3 + i),
  }));

  return {
    customers,
    bookings,
    inventory,
    promos,
    emails: [],
    campaigns: [],
    activity: [
      {
        id: newId("act"),
        at: new Date(),
        actor: "System",
        action: "seeded",
        entityType: "settings",
        entityId: "-",
        summary: `Workspace initialized with ${customers.length} customers and ${bookings.length} bookings.`,
      },
    ],
    settings: DEFAULT_SETTINGS,
  };
}

/* ── Persistence ────────────────────────────────────────────────────── */

const DATE_KEYS = new Set([
  "eventDate",
  "createdAt",
  "updatedAt",
  "sentAt",
  "expiresAt",
  "at",
  "purchasedAt",
  "lastBookingDate",
  "firstBookingDate",
]);

function reviver(key: string, value: unknown): unknown {
  if (DATE_KEYS.has(key) && typeof value === "string") return new Date(value);
  return value;
}

function load(): AdminState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    return JSON.parse(raw, reviver) as AdminState;
  } catch {
    return seedState();
  }
}

function persist(state: AdminState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota exceeded — keep working in memory */
  }
}

/* ── Store core ─────────────────────────────────────────────────────── */

let state: AdminState = load();
const listeners = new Set<() => void>();

function emit(): void {
  persist(state);
  listeners.forEach((l) => l());
}

type LogInput = {
  entityType: ActivityEntityType;
  entityId: string;
  action: string;
  summary: string;
};

/**
 * The single write path into the store. Applies a partial patch derived from the
 * current state and, when provided, appends one audit-log entry in the same
 * atomic update so the log can never drift from the data it describes.
 */
function commit(patch: (prev: AdminState) => Partial<AdminState>, logInput?: LogInput): void {
  const partial = patch(state);
  const activity = logInput
    ? [
        { id: newId("act"), at: new Date(), actor: ACTOR, ...logInput } satisfies ActivityEntry,
        ...state.activity,
      ].slice(0, 400)
    : state.activity;
  state = { ...state, ...partial, activity };
  emit();
}

export const adminStore = {
  getState: (): AdminState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset(): void {
    state = seedState();
    emit();
  },
};

export function useAdminState(): AdminState {
  return useSyncExternalStore(adminStore.subscribe, adminStore.getState, adminStore.getState);
}

/* ── Customer actions ───────────────────────────────────────────────── */

export const customerActions = {
  create(input: Omit<AdminCustomer, "id" | "createdAt" | "notes" | "archived">): AdminCustomer {
    const customer: AdminCustomer = {
      ...input,
      id: newId("cust"),
      createdAt: new Date(),
      notes: [],
      archived: false,
    };
    commit((prev) => ({ customers: [customer, ...prev.customers] }), {
      entityType: "customer",
      entityId: customer.id,
      action: "created",
      summary: `Created customer ${customer.name}.`,
    });
    return customer;
  },

  update(id: string, patch: Partial<AdminCustomer>): void {
    const existing = state.customers.find((c) => c.id === id);
    commit(
      (prev) => ({
        customers: prev.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      }),
      {
        entityType: "customer",
        entityId: id,
        action: "updated",
        summary: `Updated customer ${existing?.name ?? id}.`,
      },
    );
  },

  /** Deletes the customer and every booking attached to them. */
  remove(id: string): void {
    const existing = state.customers.find((c) => c.id === id);
    const lostBookings = state.bookings.filter((b) => b.customerId === id).length;
    commit(
      (prev) => ({
        customers: prev.customers.filter((c) => c.id !== id),
        bookings: prev.bookings.filter((b) => b.customerId !== id),
      }),
      {
        entityType: "customer",
        entityId: id,
        action: "deleted",
        summary: `Deleted customer ${existing?.name ?? id} and ${lostBookings} booking(s).`,
      },
    );
  },

  setArchived(id: string, archived: boolean): void {
    const existing = state.customers.find((c) => c.id === id);
    commit(
      (prev) => ({
        customers: prev.customers.map((c) => (c.id === id ? { ...c, archived } : c)),
      }),
      {
        entityType: "customer",
        entityId: id,
        action: archived ? "archived" : "restored",
        summary: `${archived ? "Archived" : "Restored"} customer ${existing?.name ?? id}.`,
      },
    );
  },

  addNote(id: string, body: string): void {
    const note: CustomerNote = { id: newId("note"), body, author: ACTOR, createdAt: new Date() };
    const existing = state.customers.find((c) => c.id === id);
    commit(
      (prev) => ({
        customers: prev.customers.map((c) =>
          c.id === id ? { ...c, notes: [note, ...c.notes] } : c,
        ),
      }),
      {
        entityType: "customer",
        entityId: id,
        action: "note-added",
        summary: `Added a note to ${existing?.name ?? id}.`,
      },
    );
  },

  removeNote(customerId: string, noteId: string): void {
    commit((prev) => ({
      customers: prev.customers.map((c) =>
        c.id === customerId ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c,
      ),
    }));
  },

  toggleTag(id: string, tag: CustomerTag): void {
    commit((prev) => ({
      customers: prev.customers.map((c) =>
        c.id === id
          ? {
              ...c,
              tags: c.tags.includes(tag) ? c.tags.filter((t) => t !== tag) : [...c.tags, tag],
            }
          : c,
      ),
    }));
  },
};

/* ── Booking actions ────────────────────────────────────────────────── */

export const bookingActions = {
  update(id: string, patch: Partial<AdminBooking>): void {
    commit(
      (prev) => ({
        bookings: prev.bookings.map((b) =>
          b.id === id ? { ...b, ...patch, updatedAt: new Date() } : b,
        ),
      }),
      {
        entityType: "booking",
        entityId: id,
        action: "updated",
        summary: `Updated booking ${id.slice(0, 12)}.`,
      },
    );
  },

  setStatus(id: string, status: AdminBookingStatus): void {
    commit(
      (prev) => ({
        bookings: prev.bookings.map((b) =>
          b.id === id ? { ...b, status, updatedAt: new Date() } : b,
        ),
      }),
      {
        entityType: "booking",
        entityId: id,
        action: "status-changed",
        summary: `Booking ${id.slice(0, 12)} → ${status}.`,
      },
    );
  },

  setPaymentStatus(id: string, paymentStatus: PaymentStatus): void {
    commit(
      (prev) => ({
        bookings: prev.bookings.map((b) =>
          b.id === id ? { ...b, paymentStatus, updatedAt: new Date() } : b,
        ),
      }),
      {
        entityType: "booking",
        entityId: id,
        action: "payment-updated",
        summary: `Payment for ${id.slice(0, 12)} → ${paymentStatus}.`,
      },
    );
  },

  remove(id: string): void {
    commit((prev) => ({ bookings: prev.bookings.filter((b) => b.id !== id) }), {
      entityType: "booking",
      entityId: id,
      action: "deleted",
      summary: `Deleted booking ${id.slice(0, 12)}.`,
    });
  },

  bulkSetStatus(ids: string[], status: AdminBookingStatus): void {
    const idSet = new Set(ids);
    commit(
      (prev) => ({
        bookings: prev.bookings.map((b) =>
          idSet.has(b.id) ? { ...b, status, updatedAt: new Date() } : b,
        ),
      }),
      {
        entityType: "booking",
        entityId: "bulk",
        action: "bulk-status",
        summary: `Set ${ids.length} booking(s) to ${status}.`,
      },
    );
  },

  bulkRemove(ids: string[]): void {
    const idSet = new Set(ids);
    commit((prev) => ({ bookings: prev.bookings.filter((b) => !idSet.has(b.id)) }), {
      entityType: "booking",
      entityId: "bulk",
      action: "bulk-delete",
      summary: `Deleted ${ids.length} booking(s).`,
    });
  },
};

/* ── Inventory actions ──────────────────────────────────────────────── */

export const inventoryActions = {
  create(input: Omit<AdminInventoryItem, "id" | "maintenance">): AdminInventoryItem {
    const item: AdminInventoryItem = { ...input, id: newId("inv"), maintenance: [] };
    commit((prev) => ({ inventory: [item, ...prev.inventory] }), {
      entityType: "inventory",
      entityId: item.id,
      action: "created",
      summary: `Added inventory item ${item.name}.`,
    });
    return item;
  },

  update(id: string, patch: Partial<AdminInventoryItem>): void {
    const existing = state.inventory.find((i) => i.id === id);
    commit(
      (prev) => ({
        inventory: prev.inventory.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      }),
      {
        entityType: "inventory",
        entityId: id,
        action: "updated",
        summary: `Updated inventory item ${existing?.name ?? id}.`,
      },
    );
  },

  remove(id: string): void {
    const existing = state.inventory.find((i) => i.id === id);
    commit((prev) => ({ inventory: prev.inventory.filter((i) => i.id !== id) }), {
      entityType: "inventory",
      entityId: id,
      action: "deleted",
      summary: `Removed inventory item ${existing?.name ?? id}.`,
    });
  },

  setStatus(id: string, status: InventoryStatus): void {
    const existing = state.inventory.find((i) => i.id === id);
    commit(
      (prev) => ({
        inventory: prev.inventory.map((i) => (i.id === id ? { ...i, status } : i)),
      }),
      {
        entityType: "inventory",
        entityId: id,
        action: "status-changed",
        summary: `${existing?.name ?? id} → ${status}.`,
      },
    );
  },

  addMaintenance(id: string, entry: Omit<MaintenanceEntry, "id">): void {
    const record: MaintenanceEntry = { ...entry, id: newId("mnt") };
    const existing = state.inventory.find((i) => i.id === id);
    commit(
      (prev) => ({
        inventory: prev.inventory.map((i) =>
          i.id === id ? { ...i, maintenance: [record, ...i.maintenance] } : i,
        ),
      }),
      {
        entityType: "inventory",
        entityId: id,
        action: "maintenance-logged",
        summary: `Logged ${entry.type} on ${existing?.name ?? id}: ${entry.note}`,
      },
    );
  },
};

/* ── Promo actions ──────────────────────────────────────────────────── */

export const promoActions = {
  create(input: Omit<AdminPromoCode, "id" | "createdAt" | "usageCount">): AdminPromoCode {
    const promo: AdminPromoCode = {
      ...input,
      id: newId("promo"),
      createdAt: new Date(),
      usageCount: 0,
    };
    commit((prev) => ({ promos: [promo, ...prev.promos] }), {
      entityType: "promo",
      entityId: promo.id,
      action: "created",
      summary: `Created promo code ${promo.code}.`,
    });
    return promo;
  },

  update(id: string, patch: Partial<AdminPromoCode>): void {
    const existing = state.promos.find((p) => p.id === id);
    commit((prev) => ({ promos: prev.promos.map((p) => (p.id === id ? { ...p, ...patch } : p)) }), {
      entityType: "promo",
      entityId: id,
      action: "updated",
      summary: `Updated promo ${existing?.code ?? id}.`,
    });
  },

  remove(id: string): void {
    const existing = state.promos.find((p) => p.id === id);
    commit((prev) => ({ promos: prev.promos.filter((p) => p.id !== id) }), {
      entityType: "promo",
      entityId: id,
      action: "deleted",
      summary: `Deleted promo ${existing?.code ?? id}.`,
    });
  },

  toggleActive(id: string): void {
    const existing = state.promos.find((p) => p.id === id);
    commit(
      (prev) => ({
        promos: prev.promos.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
      }),
      {
        entityType: "promo",
        entityId: id,
        action: "toggled",
        summary: `${existing?.code ?? id} is now ${existing?.active ? "inactive" : "active"}.`,
      },
    );
  },

  /** Increments usage — called when a code is redeemed at checkout. */
  recordRedemption(code: string): void {
    const normalized = code.trim().toUpperCase();
    commit((prev) => ({
      promos: prev.promos.map((p) =>
        p.code === normalized ? { ...p, usageCount: p.usageCount + 1 } : p,
      ),
    }));
  },
};

/* ── Email + campaign actions ───────────────────────────────────────── */

export const emailActions = {
  send(input: {
    recipients: EmailRecipient[];
    subject: string;
    body: string;
    kind: EmailMessage["kind"];
    campaignId?: string | null;
  }): EmailMessage {
    const message: EmailMessage = {
      id: newId("email"),
      kind: input.kind,
      campaignId: input.campaignId ?? null,
      recipients: input.recipients,
      subject: input.subject,
      body: input.body,
      sentAt: new Date(),
      sentBy: ACTOR,
      // Simulated engagement so the reporting surfaces have real-looking data.
      openedCount: Math.round(input.recipients.length * (0.35 + Math.random() * 0.3)),
      clickedCount: Math.round(input.recipients.length * (0.05 + Math.random() * 0.15)),
    };
    commit((prev) => ({ emails: [message, ...prev.emails] }), {
      entityType: "email",
      entityId: message.id,
      action: "sent",
      summary: `Sent "${input.subject}" to ${input.recipients.length} recipient(s).`,
    });
    return message;
  },

  remove(id: string): void {
    commit((prev) => ({ emails: prev.emails.filter((e) => e.id !== id) }));
  },
};

export const campaignActions = {
  saveDraft(
    input: Omit<
      Campaign,
      "id" | "createdAt" | "sentAt" | "status" | "openedCount" | "clickedCount"
    >,
  ): Campaign {
    const campaign: Campaign = {
      ...input,
      id: newId("camp"),
      status: "draft",
      createdAt: new Date(),
      sentAt: null,
      openedCount: 0,
      clickedCount: 0,
    };
    commit((prev) => ({ campaigns: [campaign, ...prev.campaigns] }), {
      entityType: "campaign",
      entityId: campaign.id,
      action: "draft-saved",
      summary: `Saved campaign draft "${campaign.name}".`,
    });
    return campaign;
  },

  update(id: string, patch: Partial<Campaign>): void {
    commit((prev) => ({
      campaigns: prev.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },

  remove(id: string): void {
    const existing = state.campaigns.find((c) => c.id === id);
    commit((prev) => ({ campaigns: prev.campaigns.filter((c) => c.id !== id) }), {
      entityType: "campaign",
      entityId: id,
      action: "deleted",
      summary: `Deleted campaign "${existing?.name ?? id}".`,
    });
  },

  markSent(id: string, recipientCount: number, opened: number, clicked: number): void {
    const existing = state.campaigns.find((c) => c.id === id);
    commit(
      (prev) => ({
        campaigns: prev.campaigns.map((c) =>
          c.id === id
            ? {
                ...c,
                status: "sent" as const,
                sentAt: new Date(),
                recipientCount,
                openedCount: opened,
                clickedCount: clicked,
              }
            : c,
        ),
      }),
      {
        entityType: "campaign",
        entityId: id,
        action: "sent",
        summary: `Campaign "${existing?.name ?? id}" sent to ${recipientCount} recipient(s).`,
      },
    );
  },
};

/* ── Settings actions ───────────────────────────────────────────────── */

export const settingsActions = {
  update(patch: Partial<AdminSettings>): void {
    commit((prev) => ({ settings: { ...prev.settings, ...patch } }), {
      entityType: "settings",
      entityId: "settings",
      action: "updated",
      summary: `Updated settings: ${Object.keys(patch).join(", ")}.`,
    });
  },
};

/* ── Derived selectors ──────────────────────────────────────────────── */

/** Bookings that count toward revenue — cancelled orders are excluded. */
export function revenueBookings(bookings: AdminBooking[]): AdminBooking[] {
  return bookings.filter((b) => b.status !== "cancelled");
}

export function customerMetrics(customerId: string, bookings: AdminBooking[]): CustomerMetrics {
  const mine = bookings.filter((b) => b.customerId === customerId);
  const billable = mine.filter((b) => b.status !== "cancelled");
  const lifetimeValue = billable.reduce((sum, b) => sum + b.total, 0);
  const dates = billable.map((b) => b.eventDate.getTime());

  const lastBookingDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
  const firstBookingDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;

  return {
    lifetimeValue,
    bookingCount: billable.length,
    averageOrderValue: billable.length > 0 ? lifetimeValue / billable.length : 0,
    lastBookingDate,
    firstBookingDate,
    cancelledCount: mine.length - billable.length,
    daysSinceLastBooking: lastBookingDate ? differenceInDays(new Date(), lastBookingDate) : null,
  };
}

export const SEGMENT_LABELS: Record<SegmentKey, string> = {
  all: "All customers",
  newsletter: "Newsletter subscribers",
  vip: "VIP customers",
  repeat: "Repeat customers",
  "at-risk": "At risk (90+ days quiet)",
  new: "New (no bookings yet)",
  "no-bookings": "Never booked",
  "recent-30d": "Booked in last 30 days",
};

export function resolveSegment(
  segment: SegmentKey,
  customers: AdminCustomer[],
  bookings: AdminBooking[],
): AdminCustomer[] {
  const active = customers.filter((c) => !c.archived);
  switch (segment) {
    case "all":
      return active;
    case "newsletter":
      return active.filter((c) => c.newsletterOptIn);
    case "vip":
      return active.filter((c) => c.tags.includes("vip"));
    case "repeat":
      return active.filter((c) => customerMetrics(c.id, bookings).bookingCount >= 2);
    case "at-risk":
      return active.filter((c) => {
        const m = customerMetrics(c.id, bookings);
        return m.bookingCount > 0 && (m.daysSinceLastBooking ?? 0) >= 90;
      });
    case "new":
    case "no-bookings":
      return active.filter((c) => customerMetrics(c.id, bookings).bookingCount === 0);
    case "recent-30d":
      return active.filter((c) => {
        const m = customerMetrics(c.id, bookings);
        return m.daysSinceLastBooking !== null && m.daysSinceLastBooking <= 30;
      });
    default:
      return active;
  }
}
