import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE = "https://jumpcityinflatablerentals.com";

const CATEGORY_SLUGS = [
  { slug: "bounce-houses", name: "Bounce Houses" },
  { slug: "bounce-house-with-slide", name: "Bounce House with Slide" },
  { slug: "toddler-inflatables-4-y-o-and-under", name: "Toddler Inflatables" },
  { slug: "dry-slides", name: "Dry Slides" },
  { slug: "water-slides", name: "Water Slides" },
  { slug: "water-slide-bounce-houses", name: "Water Slide Bounce Houses" },
  { slug: "foam-parties", name: "Foam Parties" },
  { slug: "obstacle-courses", name: "Obstacle Courses" },
  { slug: "interactive-games", name: "Interactive Games" },
  { slug: "golf-games", name: "Golf Games" },
  { slug: "mechanical-rides", name: "Mechanical Rides" },
  { slug: "concessions", name: "Concessions" },
  { slug: "tents", name: "Tents" },
  { slug: "event-entertainers", name: "Event Entertainers" },
  { slug: "all-items", name: "All Items" },
];

function decodeHtml(str = "") {
  return str
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function priceToNumber(price) {
  const match = price?.match(/\$([\d,]+\.\d+)/);
  if (!match) return 0;
  return Number(match[1].replace(/,/g, ""));
}

function slugifyName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .substring(0, 80);
}

function extractItems(html) {
  const blocks = html.split('<div class="io_item2_list elementor-widget-heading simpleCart_ioShelfItem').slice(1);
  const items = [];
  for (const block of blocks) {
    const idMatch = block.match(/class="item_rentalid"[^>]*>\s*(\d+)\s*</);
    const hrefMatch = block.match(/<span class="item_href"[^>]*>([^<]+)</);
    const nameMatch = block.match(/class="[^"]*rentNameIO[^"]*item_name[^"]*"[^>]*>\s*<a[^>]*>([^<]+)</);
    const priceMatch = block.match(/<span class="rentNameIO_pricespan">(\$[\d,]+(?:\.\d+)?)</);
    const imageMatch = block.match(/<img[^>]*class="[^"]*category_big_img[^"]*item_image[^"]*"[^>]*src="([^"]+)"/);
    const qtyMatch = block.match(/class="item_qtytype"[^>]*>([^<]+)</);

    if (!idMatch || !hrefMatch || !nameMatch || !priceMatch) continue;

    const href = hrefMatch[1].trim();
    const name = decodeHtml(nameMatch[1]);
    const id = idMatch[1];
    const price = priceMatch[1];
    const image = imageMatch ? imageMatch[1] : "";
    const qty = qtyMatch ? qtyMatch[1].trim() : "Limited";

    const url = new URL(href, BASE);
    const segs = url.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const productSlug = segs.pop() || slugifyName(name);
    const categorySlug = segs[segs.length - 1] || "all-items";

    const blurb =
      qty === "Unlimited"
        ? "Available for your event date — check availability and reserve."
        : "Limited quantities — reserve early for your event date.";

    items.push({
      id,
      slug: productSlug,
      name,
      priceFrom: priceToNumber(price),
      dimensions: "",
      ages: "",
      image,
      blurb,
      alt: `Jump City rental: ${name}`,
      categorySlug,
    });
  }
  return items;
}

async function fetchCategory(slug) {
  const url = `${BASE}/rentals/${slug}/`;
  console.log(`Fetching ${url}`);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  console.log(`  ${slug}: ${html.length} bytes, ${html.split('<div class="io_item2_list elementor-widget-heading simpleCart_ioShelfItem').length - 1} product blocks`);
  return html;
}

function escapeString(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n");
}

async function main() {
  const allItems = [];
  for (const { slug } of CATEGORY_SLUGS) {
    try {
      const html = await fetchCategory(slug);
      const items = extractItems(html);
      console.log(`  ${slug}: ${items.length} items`);
      allItems.push(...items);
    } catch (err) {
      console.error(`  ${slug}: ${err.message}`);
    }
  }

  // Deduplicate by product id, keep lowest price entry
  const byId = new Map();
  for (const item of allItems) {
    if (!byId.has(item.id) || item.priceFrom < byId.get(item.id).priceFrom) {
      byId.set(item.id, item);
    }
  }

  const categoryMap = new Map(CATEGORY_SLUGS.map((c) => [c.slug, { ...c, items: [] }]));
  for (const item of byId.values()) {
    const cat = categoryMap.get(item.categorySlug);
    if (cat) {
      cat.items.push(item);
    } else {
      const all = categoryMap.get("all-items");
      if (all) all.items.push(item);
    }
  }

  const categories = [];
  for (const { slug, name, items } of categoryMap.values()) {
    if (items.length === 0) continue;
    const minPrice = Math.min(...items.map((i) => i.priceFrom));
    const first = items[0];
    categories.push({
      slug,
      name,
      image: first.image || "",
      alt: first.alt,
      tagline: `Starting at $${minPrice}`,
      description: `Browse ${name.toLowerCase()} from Jump City Inflatable Rentals.`,
      items,
    });
  }

  const output = [
    'import type { Category } from "./site";',
    "",
    "export const categories: Category[] = [",
    ...categories.flatMap((cat, ci) => {
      const lines = [];
      lines.push(`${ci === 0 ? "" : "  "}  {`);
      lines.push(`    slug: "${escapeString(cat.slug)}",`);
      lines.push(`    name: "${escapeString(cat.name)}",`);
      lines.push(`    image: "${escapeString(cat.image)}",`);
      lines.push(`    alt: "${escapeString(cat.alt)}",`);
      lines.push(`    tagline: "${escapeString(cat.tagline)}",`);
      lines.push(`    description: "${escapeString(cat.description)}",`);
      lines.push(`    items: [`);
      cat.items.forEach((item, ii) => {
        lines.push("      {");
        lines.push(`        slug: "${escapeString(item.slug)}",`);
        lines.push(`        name: "${escapeString(item.name)}",`);
        lines.push(`        priceFrom: ${item.priceFrom},`);
        lines.push(`        dimensions: "${escapeString(item.dimensions)}",`);
        lines.push(`        ages: "${escapeString(item.ages)}",`);
        lines.push(`        image: "${escapeString(item.image)}",`);
        lines.push(`        blurb: "${escapeString(item.blurb)}",`);
        lines.push(`        alt: "${escapeString(item.alt)}",`);
        lines.push("      },");
      });
      lines.push("    ],");
      lines.push("  },");
      return lines;
    }),
    "];",
    "",
  ].join("\n");

  const outPath = join(__dirname, "..", "src", "data", "site-scraped.ts");
  writeFileSync(outPath, output);
  console.log(`Wrote ${categories.length} categories (${byId.size} unique items) to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
