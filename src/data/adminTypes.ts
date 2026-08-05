import type { Category, RentalItem } from "@/data/site";
import type { BookingAddress, DeliveryWindow } from "@/data/mockBookings";

/* ── Bookings ───────────────────────────────────────────────────────── */

/**
 * Full booking lifecycle. `open` is a raw request, `sent` means the invoice
 * went out, `confirmed` means the deposit cleared, `completed` is post-event,
 * and `cancelled` is terminal.
 */
export type AdminBookingStatus = "open" | "sent" | "confirmed" | "completed" | "cancelled";

export type PaymentStatus = "unpaid" | "deposit-paid" | "paid-in-full" | "refunded";

export type AdminBooking = {
  id: string;
  customerId: string;
  item: RentalItem;
  category: Category;
  eventDate: Date;
  deliveryWindow: DeliveryWindow;
  address: BookingAddress;
  instructions: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoCode: string | null;
  tax: number;
  total: number;
  deposit: number;
  balance: number;
  status: AdminBookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
};

/* ── Customers ──────────────────────────────────────────────────────── */

export type CustomerTag = "vip" | "repeat" | "new" | "at-risk" | "corporate" | "referral";

export type CustomerNote = {
  id: string;
  body: string;
  author: string;
  createdAt: Date;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: BookingAddress | null;
  createdAt: Date;
  newsletterOptIn: boolean;
  tags: CustomerTag[];
  notes: CustomerNote[];
  archived: boolean;
};

/** Derived customer metrics — never stored, always computed from bookings. */
export type CustomerMetrics = {
  lifetimeValue: number;
  bookingCount: number;
  averageOrderValue: number;
  lastBookingDate: Date | null;
  firstBookingDate: Date | null;
  cancelledCount: number;
  daysSinceLastBooking: number | null;
};

/* ── Inventory ──────────────────────────────────────────────────────── */

export type InventoryStatus = "available" | "reserved" | "damaged" | "out-for-cleaning" | "retired";

export type MaintenanceEntry = {
  id: string;
  at: Date;
  type: "cleaning" | "repair" | "inspection";
  note: string;
  cost: number;
  performedBy: string;
};

export type AdminInventoryItem = {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  image: string;
  alt: string;
  priceFrom: number;
  status: InventoryStatus;
  timesRented: number;
  purchasePrice: number;
  purchasedAt: Date;
  condition: 1 | 2 | 3 | 4 | 5;
  maintenance: MaintenanceEntry[];
  notes: string;
};

/* ── Promo codes ────────────────────────────────────────────────────── */

export type AdminPromoCode = {
  id: string;
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  expiresAt: Date | null;
  active: boolean;
  usageCount: number;
  usageLimit: number | null;
  createdAt: Date;
};

/* ── Email + marketing ──────────────────────────────────────────────── */

export type EmailKind = "transactional" | "campaign";

export type EmailRecipient = {
  customerId: string;
  name: string;
  email: string;
};

export type EmailMessage = {
  id: string;
  kind: EmailKind;
  campaignId: string | null;
  recipients: EmailRecipient[];
  subject: string;
  body: string;
  sentAt: Date;
  sentBy: string;
  openedCount: number;
  clickedCount: number;
};

export type SegmentKey =
  "all" | "newsletter" | "vip" | "repeat" | "at-risk" | "new" | "no-bookings" | "recent-30d";

export type CampaignStatus = "draft" | "sent";

export type Campaign = {
  id: string;
  name: string;
  subject: string;
  body: string;
  segment: SegmentKey;
  status: CampaignStatus;
  recipientCount: number;
  createdAt: Date;
  sentAt: Date | null;
  openedCount: number;
  clickedCount: number;
};

/* ── Activity audit log ─────────────────────────────────────────────── */

export type ActivityEntityType =
  "booking" | "customer" | "inventory" | "promo" | "email" | "campaign" | "settings";

export type ActivityEntry = {
  id: string;
  at: Date;
  actor: string;
  action: string;
  entityType: ActivityEntityType;
  entityId: string;
  summary: string;
};

/* ── Settings ───────────────────────────────────────────────────────── */

export type AdminSettings = {
  businessName: string;
  contactEmail: string;
  contactPhone: string;
  addressLine: string;
  taxRate: number;
  depositPercent: number;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  emailSenderName: string;
  emailSignature: string;
  notifyOnNewBooking: boolean;
  notifyOnCancellation: boolean;
  autoSendInvoice: boolean;
};

/* ── Store shape ────────────────────────────────────────────────────── */

export type AdminState = {
  customers: AdminCustomer[];
  bookings: AdminBooking[];
  inventory: AdminInventoryItem[];
  promos: AdminPromoCode[];
  emails: EmailMessage[];
  campaigns: Campaign[];
  activity: ActivityEntry[];
  settings: AdminSettings;
};
