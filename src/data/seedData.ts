import { addDays, subDays, subMonths } from "date-fns";

import type { BookingRequest, DeliveryWindow } from "@/data/mockBookings";
import type { Category, RentalItem } from "@/data/site";
import { categories } from "@/data/site";
import type { PromoCode } from "@/data/promoCodes";
import { promoCodes } from "@/data/promoCodes";

export type InventoryStatus = "available" | "damaged" | "out-for-cleaning";
export type InventoryItem = {
  item: RentalItem;
  categorySlug: string;
  status: InventoryStatus;
  timesRented: number;
};

export type SeedCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  bookings: BookingRequest[];
  newsletterOptIn: boolean;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: "lead" | "helper" | "driver";
};

const firstNames = [
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
];
const lastNames = [
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
];
const cities = [
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
const streets = [
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
  return arr[i % arr.length]!;
}

function generateSeedCustomers(): SeedCustomer[] {
  const allItems: { item: RentalItem; category: Category }[] = [];
  for (const cat of categories) {
    for (const item of cat.items) {
      allItems.push({ item, category: cat });
    }
  }

  const customers: SeedCustomer[] = [];
  const windows: DeliveryWindow[] = [
    "Standard Delivery",
    "Event Day Delivery",
    "1-Hour Window Delivery",
  ];

  for (let i = 0; i < 25; i++) {
    const name = `${pick(firstNames, i)} ${pick(lastNames, i * 3)}`;
    const email = `${pick(firstNames, i).toLowerCase()}.${pick(lastNames, i * 3).toLowerCase()}@example.com`;
    const createdAt = subMonths(new Date(), (i % 8) + 1);
    const numBookings = (i % 3) + 1;
    const bookings: BookingRequest[] = [];

    for (let b = 0; b < numBookings; b++) {
      const { item, category } = pick(allItems, i * 7 + b * 3);
      const eventDate = subDays(new Date(), (i * 11 + b * 20) % 180);
      const deliveryFee = Math.random() > 0.5 ? 0 : 49;
      const subtotal = item.priceFrom;
      const tax = Math.round(subtotal * 0.07375 * 100) / 100;
      const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;
      const deposit = Math.round(total * 0.5 * 100) / 100;

      bookings.push({
        id: `seed-${i}-${b}`,
        item,
        category,
        eventDate,
        deliveryWindow: pick(windows, i + b),
        address: {
          street: pick(streets, i + b),
          city: pick(cities, i + b),
          state: "MN",
          zip: `5540${(i + b) % 9}`,
        },
        instructions: "",
        subtotal,
        deliveryFee,
        tax,
        total,
        deposit,
        balance: Math.round((total - deposit) * 100) / 100,
        status: eventDate < new Date() ? "sent" : "open",
        createdAt: subDays(eventDate, 7),
      });
    }

    customers.push({
      id: `seed-cust-${i}`,
      name,
      email,
      phone: `(763) 555-${String(1000 + i).slice(-4)}`,
      createdAt,
      bookings,
      newsletterOptIn: i % 3 !== 0,
    });
  }

  return customers;
}

export const seedCustomers: SeedCustomer[] = generateSeedCustomers();

export function generateInventory(): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (const cat of categories) {
    for (const item of cat.items) {
      const statusRoll = item.slug.charCodeAt(0) % 10;
      const status: InventoryStatus =
        statusRoll === 0 ? "damaged" : statusRoll === 1 ? "out-for-cleaning" : "available";
      items.push({
        item,
        categorySlug: cat.slug,
        status,
        timesRented: 5 + (item.slug.charCodeAt(0) % 20),
      });
    }
  }
  return items;
}

export const seedInventory: InventoryItem[] = generateInventory();

export const seedEmployees: Employee[] = [
  { id: "emp-1", name: "Shawn M.", email: "shawn@jumpcityinflatablerentals.com", role: "lead" },
  { id: "emp-2", name: "Carlos R.", email: "carlos@jumpcityinflatablerentals.com", role: "driver" },
  { id: "emp-3", name: "Tony B.", email: "tony@jumpcityinflatablerentals.com", role: "helper" },
  { id: "emp-4", name: "Marcus J.", email: "marcus@jumpcityinflatablerentals.com", role: "helper" },
  { id: "emp-5", name: "Devon K.", email: "devon@jumpcityinflatablerentals.com", role: "driver" },
];

export { promoCodes as seedPromoCodes };
export type { PromoCode };
