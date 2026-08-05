import { addDays, differenceInCalendarDays, isSameDay, startOfDay } from "date-fns";

import type { RentalItem } from "@/data/site";

/**
 * Deterministic mock availability — same seed logic as BookingFlow's
 * getMockBookedDates, extracted so the rentals grid can reuse it.
 */
export function getMockBookedDates(item: RentalItem): Date[] {
  const today = startOfDay(new Date());
  const out: Date[] = [];
  const seedBase = item.slug.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  for (let i = 1; i <= 60 && out.length < 10; i++) {
    const d = addDays(today, i);
    const code = seedBase + d.getDate() + d.getMonth();
    if (code % 7 === 0) out.push(d);
  }
  return out;
}

export function isItemAvailableOn(item: RentalItem, date: Date): boolean {
  const booked = getMockBookedDates(item);
  return !booked.some((b) => isSameDay(b, date));
}

/**
 * Checks whether an item is free for every day from delivery through pickup.
 * If no pickup date is given, only the delivery day is checked.
 */
export function isItemAvailableForRange(
  item: RentalItem,
  deliveryDate: Date,
  pickupDate?: Date,
): boolean {
  const booked = getMockBookedDates(item);
  const start = startOfDay(deliveryDate);
  const end = startOfDay(pickupDate ?? deliveryDate);

  for (let d = start; d <= end; d = addDays(d, 1)) {
    if (booked.some((b) => isSameDay(b, d))) return false;
  }
  return true;
}

/** Number of rental days for a delivery/pickup pair (minimum 1). */
export function rentalDayCount(deliveryDate: Date, pickupDate?: Date): number {
  if (!pickupDate) return 1;
  return Math.max(
    1,
    differenceInCalendarDays(startOfDay(pickupDate), startOfDay(deliveryDate)) + 1,
  );
}
