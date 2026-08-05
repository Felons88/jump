import { format } from "date-fns";

import { formatMoney } from "@/data/mockBookings";
import type { AdminBooking, AdminCustomer, AdminSettings } from "@/data/adminTypes";

/**
 * Merge tags are resolved at send time. Anything unresolved is stripped so a
 * customer never receives a raw `{{token}}` in their inbox.
 */
export const MERGE_TAGS = [
  { tag: "{{first_name}}", description: "Customer's first name" },
  { tag: "{{full_name}}", description: "Customer's full name" },
  { tag: "{{email}}", description: "Customer's email address" },
  { tag: "{{phone}}", description: "Customer's phone number" },
  { tag: "{{business_name}}", description: "Your business name" },
  { tag: "{{business_phone}}", description: "Your business phone" },
  { tag: "{{signature}}", description: "Your email signature" },
  { tag: "{{item_name}}", description: "Booked item (booking emails only)" },
  { tag: "{{event_date}}", description: "Event date (booking emails only)" },
  { tag: "{{total}}", description: "Booking total (booking emails only)" },
  { tag: "{{balance}}", description: "Balance due (booking emails only)" },
  { tag: "{{address}}", description: "Delivery address (booking emails only)" },
] as const;

export type TemplateCategory = "transactional" | "marketing" | "service";

export type EmailTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  body: string;
  /** True when the template depends on booking-scoped merge tags. */
  requiresBooking: boolean;
};

export const emailTemplates: EmailTemplate[] = [
  {
    id: "tpl-blank",
    name: "Blank message",
    category: "service",
    subject: "",
    body: "Hi {{first_name}},\n\n\n\n{{signature}}",
    requiresBooking: false,
  },
  {
    id: "tpl-booking-confirm",
    name: "Booking confirmation",
    category: "transactional",
    subject: "Your {{item_name}} is confirmed for {{event_date}}",
    body: [
      "Hi {{first_name}},",
      "",
      "Great news — your rental is locked in!",
      "",
      "Item: {{item_name}}",
      "Event date: {{event_date}}",
      "Delivery address: {{address}}",
      "Order total: {{total}}",
      "Balance due before delivery: {{balance}}",
      "",
      "Our team will text you the morning of your event with an arrival window. Please make sure the setup area is clear and we have a path at least 4 feet wide to reach it.",
      "",
      "Questions? Just reply to this email or call {{business_phone}}.",
      "",
      "{{signature}}",
    ].join("\n"),
    requiresBooking: true,
  },
  {
    id: "tpl-invoice",
    name: "Invoice / balance due",
    category: "transactional",
    subject: "Invoice for your {{event_date}} rental — {{total}}",
    body: [
      "Hi {{first_name}},",
      "",
      "Here is the invoice for your upcoming rental.",
      "",
      "Item: {{item_name}}",
      "Event date: {{event_date}}",
      "Order total: {{total}}",
      "Balance due: {{balance}}",
      "",
      "Payment is due before delivery. You can pay by replying to this email for a secure link, or settle up with the driver on arrival.",
      "",
      "{{signature}}",
    ].join("\n"),
    requiresBooking: true,
  },
  {
    id: "tpl-reminder",
    name: "Event reminder (3 days out)",
    category: "transactional",
    subject: "See you on {{event_date}}! Quick setup checklist",
    body: [
      "Hi {{first_name}},",
      "",
      "Your {{item_name}} rental is coming up on {{event_date}}. A few quick things to prep:",
      "",
      "1. Clear the setup area — we need a flat space plus 3 feet of clearance on all sides.",
      "2. Make sure there is a power outlet within 100 feet, or let us know if you need a generator.",
      "3. Unlock gates and secure any pets during setup.",
      "",
      "Balance due at delivery: {{balance}}",
      "",
      "{{signature}}",
    ].join("\n"),
    requiresBooking: true,
  },
  {
    id: "tpl-thank-you",
    name: "Post-event thank you + review ask",
    category: "service",
    subject: "Thanks for renting with {{business_name}}!",
    body: [
      "Hi {{first_name}},",
      "",
      "Thanks for choosing us for your event — we hope the {{item_name}} was a hit!",
      "",
      "If you have 30 seconds, would you leave us a quick review? It genuinely helps a small local business like ours get found by other families.",
      "",
      "And because you're a repeat-worthy customer: mention code THANKS10 on your next booking for 10% off.",
      "",
      "{{signature}}",
    ].join("\n"),
    requiresBooking: true,
  },
  {
    id: "tpl-winback",
    name: "Win-back (quiet customers)",
    category: "marketing",
    subject: "We miss you, {{first_name}} — here's 15% off",
    body: [
      "Hi {{first_name}},",
      "",
      "It's been a while since your last event with us, and we'd love to have you back.",
      "",
      "Use code COMEBACK15 for 15% off any rental booked this month. We've added several new inflatables since your last visit — including a few big-kid obstacle courses.",
      "",
      "Browse the lineup and grab your date before the weekend slots fill up.",
      "",
      "{{signature}}",
    ].join("\n"),
    requiresBooking: false,
  },
  {
    id: "tpl-seasonal",
    name: "Seasonal promo blast",
    category: "marketing",
    subject: "Summer dates are opening up — book early and save",
    body: [
      "Hi {{first_name}},",
      "",
      "Summer weekends book out fast around here. We're opening the calendar now, and early birds get the best pick.",
      "",
      "Reserve any bounce house or water slide this month and take 10% off with code SUMMER10.",
      "",
      "Popular Saturdays typically sell out 4–6 weeks ahead, so if you already have a date in mind, now is the time.",
      "",
      "{{signature}}",
    ].join("\n"),
    requiresBooking: false,
  },
  {
    id: "tpl-referral",
    name: "Referral request",
    category: "marketing",
    subject: "Know someone planning a party?",
    body: [
      "Hi {{first_name}},",
      "",
      "You've been a great customer, so we wanted to extend our referral offer to you first.",
      "",
      "Refer a friend and you BOTH get $25 off your next rental. Just have them mention your name when they book.",
      "",
      "No limit — refer as many friends as you like.",
      "",
      "{{signature}}",
    ].join("\n"),
    requiresBooking: false,
  },
];

/* ── Merge tag resolution ───────────────────────────────────────────── */

type MergeContext = {
  customer: AdminCustomer;
  settings: AdminSettings;
  booking?: AdminBooking | null;
};

function buildMap({ customer, settings, booking }: MergeContext): Record<string, string> {
  const map: Record<string, string> = {
    first_name: customer.name.split(" ")[0] ?? customer.name,
    full_name: customer.name,
    email: customer.email,
    phone: customer.phone,
    business_name: settings.businessName,
    business_phone: settings.contactPhone,
    signature: settings.emailSignature,
  };

  if (booking) {
    map["item_name"] = booking.item.name;
    map["event_date"] = format(booking.eventDate, "EEEE, MMMM d, yyyy");
    map["total"] = formatMoney(booking.total);
    map["balance"] = formatMoney(booking.balance);
    map["address"] =
      `${booking.address.street}, ${booking.address.city}, ${booking.address.state} ${booking.address.zip}`;
  }

  return map;
}

/**
 * Replaces every `{{token}}` with its resolved value. Tokens with no available
 * value resolve to an empty string rather than leaking the raw token.
 */
export function renderTemplate(text: string, ctx: MergeContext): string {
  const map = buildMap(ctx);
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => map[key] ?? "");
}

/** Lists tokens present in the text that cannot be resolved with this context. */
export function findUnresolvedTags(text: string, ctx: MergeContext): string[] {
  const map = buildMap(ctx);
  const found = new Set<string>();
  for (const match of text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) {
    const key = match[1]!;
    if (map[key] === undefined) found.add(`{{${key}}}`);
  }
  return [...found];
}
