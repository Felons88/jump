import type { Category, RentalItem } from "@/data/site";

export type DeliveryWindow = "Standard Delivery" | "Event Day Delivery" | "1-Hour Window Delivery";

export type BookingAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type BookingRequest = {
  id: string;
  item: RentalItem;
  category: Category;
  eventDate: Date;
  deliveryWindow: DeliveryWindow;
  address: BookingAddress;
  instructions: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  deposit: number;
  balance: number;
  status: "open" | "sent";
  createdAt: Date;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatMoney(n: number): string {
  return money.format(n);
}

const bookings: BookingRequest[] = [];

export function addBooking(booking: BookingRequest): void {
  bookings.push(booking);
}

export function getBookings(): BookingRequest[] {
  return bookings;
}

export function finalizeBooking(id: string): BookingRequest | undefined {
  const booking = bookings.find((b) => b.id === id);
  if (booking) {
    booking.status = "sent";
  }
  return booking;
}
