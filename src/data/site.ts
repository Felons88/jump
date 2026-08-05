// Stock placeholders — still used only for items we have no real photo of yet.
import games from "@/assets/cat-games.jpg";
import concessions from "@/assets/cat-concessions.jpg";
import entertainers from "@/assets/cat-entertainers.jpg";
import mechanical from "@/assets/cat-mechanical.jpg";
import waterslide from "@/assets/cat-waterslide.jpg";
import tent from "@/assets/cat-tent.jpg";

// Real Jump City inventory and event photos.
import pawPatrolBounce from "@/assets/paw-patrol.jpg";
import modularBounce from "@/assets/bouncer.jpg";
import princessBounce from "@/assets/princess-1.jpg";
import scoobyBounce from "@/assets/schooby-doo.jpg";
import bounceLineup from "@/assets/bounce-cleaning.jpg";
import bounceSanitizing from "@/assets/bounce-house-cleaning.jpg";
import domeBounce from "@/assets/color-dome.jpg";
import helicopterBounce from "@/assets/colorful-head-bounce.jpg";
import castleCombo from "@/assets/2-1-bouncce.jpg";
import purpleCastleCombo from "@/assets/purple-castle.jpg";
import princessCombo from "@/assets/2-1-princess.jpg";
import fireEngineCombo from "@/assets/fire-engine.jpg";
import tallDrySlide from "@/assets/35ft-sling-shot.jpg";
import mightyLoaderSlide from "@/assets/mighty-loader.jpg";
import dualLaneDrySlide from "@/assets/high-voltage-slide.jpg";
import waterSlideLineup from "@/assets/water-slides.jpg";
import rainbowWaterSlide from "@/assets/waterslide-rented.jpg";
import purpleWaterSlide from "@/assets/purple-slide.jpg";
import waterSlideRiders from "@/assets/waterslide-1.jpg";
import obstacleCourse from "@/assets/obstical-course.jpg";
import megaObstacleCourse from "@/assets/large-obsitcal-course.jpg";
import gymObstacleCourse from "@/assets/school-event.jpg";
import gymMeltdown from "@/assets/school-event-3.jpg";
import gymGameLineup from "@/assets/schoolevent2.jpg";
import rockWall from "@/assets/rockwall.jpg";
import carnivalRide from "@/assets/phantoms-revenge.jpg";
import frameTents from "@/assets/tent-rental2.jpg";
import capitolTents from "@/assets/tent-rentals.jpg";
import cottonCandy from "@/assets/cottoncandy.jpg";
import minneapolisEvent from "@/assets/event1-minneaplios.jpg";
import parkEventAerial from "@/assets/event2-1.jpg";

export const PHONE = "(763) 355-1023";
export const PHONE_HREF = "tel:+17633551023";
export const EMAIL = "sales@jumpcityinflatablerentals.com";

export type RentalItem = {
  slug: string;
  name: string;
  priceFrom: number;
  dimensions: string;
  ages: string;
  image: string;
  blurb: string;
  /** Describes what the primary photo actually shows. */
  alt: string;
  /** Additional real photos of this unit, primary image first. */
  gallery?: string[];
};

export type Category = {
  slug: string;
  name: string;
  image: string;
  /** Describes what the category photo actually shows. */
  alt: string;
  tagline: string;
  description: string;
  items: RentalItem[];
};

function item(
  slug: string,
  name: string,
  priceFrom: number,
  dimensions: string,
  ages: string,
  image: string,
  blurb: string,
  alt: string,
  gallery?: string[],
): RentalItem {
  return {
    slug,
    name,
    priceFrom,
    dimensions,
    ages,
    image,
    blurb,
    alt,
    ...(gallery ? { gallery } : {}),
  };
}

export const categories: Category[] = [
  {
    slug: "bounce-houses",
    name: "Bounce Houses",
    image: bounceLineup,
    alt: "A row of Jump City bounce houses set up side by side, including block, Scooby-Doo, and princess castle units",
    tagline: "Starting at $199",
    description:
      "Classic commercial-grade bounce houses for Minneapolis and St. Paul birthday parties, block parties, and school carnivals. Delivery, setup, and pickup always included.",
    items: [
      item(
        "castle-bounce-house",
        "Classic Castle Bounce House",
        199,
        "15' W x 15' L x 14' H",
        "Ages 3–12",
        pawPatrolBounce,
        "The all-time favorite. Fits most Twin Cities backyards.",
        "Blue, red, and yellow castle-frame bounce house with a Paw Patrol banner, set up on a shaded backyard lawn",
        [pawPatrolBounce, bounceLineup],
      ),
      item(
        "modular-bounce-house",
        "Modular Bounce House",
        219,
        "15' W x 15' L x 15' H",
        "Ages 3–12",
        modularBounce,
        "Bright panels and a big jump area for busy parties.",
        "Red, yellow, and blue open-wall modular bounce house set up on grass beside a lake",
        [modularBounce, scoobyBounce],
      ),
      item(
        "princess-bounce-house",
        "Princess Party Bounce House",
        219,
        "15' W x 15' L x 14' H",
        "Ages 3–10",
        princessBounce,
        "A pink-and-purple castle theme kids ask for by name.",
        "Pink and purple princess castle bounce house with unicorn artwork and turret towers on a front lawn",
        [princessBounce, bounceSanitizing],
      ),
      item(
        "sports-arena-bounce",
        "Sports Arena Bounce House",
        229,
        "15' W x 15' L x 14' H",
        "Ages 4–14",
        games,
        "Team colors and hoops inside — great for field days.",
        "Sports-themed bounce house with team colors and an interior basketball hoop",
      ),
    ],
  },
  {
    slug: "bounce-house-with-slide",
    name: "Bounce House with Slide",
    image: fireEngineCombo,
    alt: "Fire engine themed inflatable combo with a tall flame-print slide and a truck-shaped bounce area",
    tagline: "Combo units",
    description:
      "Combo bounce houses pair a big jump area with a slide, basketball hoop, and climb wall — the most-booked category in the Twin Cities metro.",
    items: [
      item(
        "purple-combo",
        "Purple Crush Combo",
        299,
        "18' W x 20' L x 16' H",
        "Ages 3–13",
        purpleCastleCombo,
        "Jump area, climb wall, slide, and hoop in one unit.",
        "Purple, pink, and blue castle combo with an attached side slide and arched entry ramp on a lakeside lawn",
        [purpleCastleCombo, princessCombo],
      ),
      item(
        "tropical-combo",
        "Tropical Combo",
        309,
        "18' W x 22' L x 16' H",
        "Ages 3–13",
        fireEngineCombo,
        "Bright island colors with a wide exit slide.",
        "Fire engine themed inflatable combo with a tall flame-print slide and wide landing tarp",
      ),
      item(
        "castle-combo",
        "Castle Combo",
        289,
        "17' W x 20' L x 15' H",
        "Ages 3–12",
        castleCombo,
        "Classic castle look with a slide bolted on.",
        "Green, purple, and orange castle combo with turret peaks and a wide orange slide in an open field",
        [castleCombo, princessCombo],
      ),
    ],
  },
  {
    slug: "toddler-inflatables",
    name: "Toddler Inflatables",
    image: helicopterBounce,
    alt: "Small helicopter-shaped toddler bouncer with oversized purple sunglasses and a spinning red rotor on top",
    tagline: "Ages 5 and under",
    description:
      "Low-wall, soft-play inflatables sized for little jumpers at daycare events, church nurseries, and first birthdays.",
    items: [
      item(
        "toddler-playland",
        "Toddler Playland",
        189,
        "13' W x 13' L x 10' H",
        "Ages 1–5",
        helicopterBounce,
        "Soft obstacles and a mini slide for the youngest guests.",
        "Helicopter-themed toddler bouncer with soft purple sunglasses arches and a low entry step",
      ),
      item(
        "mini-bounce",
        "Mini Bounce",
        179,
        "10' W x 10' L x 10' H",
        "Ages 1–5",
        domeBounce,
        "Compact footprint for tight yards and indoor gyms.",
        "Compact rainbow-panel dome bounce house with a mesh roof and a small crawl-through entry tunnel",
      ),
    ],
  },
  {
    slug: "dry-slides",
    name: "Dry Slides",
    image: tallDrySlide,
    alt: "Very tall black, red, and yellow inflatable slide with a rider coming down the center lane",
    tagline: "Year-round fun",
    description:
      "Tall dry slides for spring and fall events when the water stays off. Indoor-friendly with the right ceiling height.",
    items: [
      item(
        "18ft-dry-slide",
        "18' Dry Slide",
        349,
        "15' W x 32' L x 18' H",
        "Ages 4+",
        mightyLoaderSlide,
        "A big drop that keeps the line moving all afternoon.",
        "Mighty Loader inflatable slide shaped like a black and yellow skid loader with a wide yellow slide lane",
        [mightyLoaderSlide, tallDrySlide],
      ),
      item(
        "24ft-dry-slide",
        "24' Dual Lane Dry Slide",
        449,
        "20' W x 40' L x 24' H",
        "Ages 5+",
        dualLaneDrySlide,
        "Two lanes so guests can race side by side.",
        "Two children racing down the twin yellow lanes of a red and black indoor dry slide in a school gym",
        [dualLaneDrySlide, gymObstacleCourse],
      ),
    ],
  },
  {
    slug: "water-slides",
    name: "Water Slides",
    image: waterSlideLineup,
    alt: "Several inflatable water slides lined up on a grass field, including dolphin and tropical palm tree units",
    tagline: "Summer favorite",
    description:
      "Minnesota summers are short — make them count. Our water slides arrive clean, sanitized, and ready for a hose hookup.",
    items: [
      item(
        "18ft-water-slide",
        "18' Water Slide",
        379,
        "15' W x 33' L x 18' H",
        "Ages 5+",
        rainbowWaterSlide,
        "Splash pool landing and a steady soak all day.",
        "Rainbow-striped inflatable water slide with a long slip lane and blue splash pool set up in a backyard",
        [rainbowWaterSlide, waterSlideRiders],
      ),
      item(
        "tropical-water-slide",
        "Tropical Water Slide",
        429,
        "18' W x 36' L x 20' H",
        "Ages 5+",
        purpleWaterSlide,
        "Big, bright, and built for hot July parties.",
        "Tall purple and blue wave-themed water slide with a wide splash pool at the bottom",
        [purpleWaterSlide, waterSlideLineup],
      ),
      item(
        "dual-lane-water-slide",
        "Dual Lane Water Slide",
        499,
        "20' W x 40' L x 22' H",
        "Ages 6+",
        waterslide,
        "Two racing lanes for camps and city events.",
        "Dual lane inflatable water slide with two side-by-side racing lanes",
      ),
    ],
  },
  {
    slug: "water-slide-bounce-houses",
    name: "Water Slide Bounce Houses",
    image: waterSlideRiders,
    alt: "Three kids sliding down a wet inflatable slide lane together with water running down the surface",
    tagline: "Wet combos",
    description:
      "Wet/dry combo units give you a bounce area plus a slide into a splash pool — book wet or dry, your call on event day.",
    items: [
      item(
        "wet-dry-combo",
        "Wet/Dry Combo",
        329,
        "18' W x 22' L x 16' H",
        "Ages 3–13",
        princessCombo,
        "Run it wet in July, dry in September.",
        "Pink and purple princess castle combo with a tall side slide that can run wet or dry",
        [princessCombo, waterSlideRiders],
      ),
      item(
        "splash-castle-combo",
        "Splash Castle Combo",
        349,
        "18' W x 24' L x 16' H",
        "Ages 4–13",
        waterslide,
        "Castle bounce with a soaking slide exit.",
        "Castle-style wet combo with a bounce area and a slide exiting into a splash pool",
      ),
    ],
  },
  {
    slug: "foam-parties",
    name: "Foam Parties",
    image: games,
    alt: "Foam party pit filled with foam for guests to play in",
    tagline: "Crowd pleaser",
    description:
      "Foam pits and cannons turn any lawn into the best party on the block. Attendant included on every foam booking.",
    items: [
      item(
        "foam-pit-party",
        "Foam Pit Party",
        599,
        "Pit is 20' x 20'",
        "All ages",
        games,
        "Includes foam solution, cannon, and an attendant.",
        "Foam pit with a foam cannon filling the play area",
      ),
    ],
  },
  {
    slug: "obstacle-courses",
    name: "Obstacle Courses",
    image: gymObstacleCourse,
    alt: "Long red, blue, and green inflatable obstacle course with a slide exit set up across a school gym floor",
    tagline: "Head-to-head racing",
    description:
      "Inflatable obstacle courses built for school field days, church picnics, and corporate team events across Minnesota.",
    items: [
      item(
        "40ft-obstacle-course",
        "40' Obstacle Course",
        549,
        "15' W x 40' L x 14' H",
        "Ages 5+",
        obstacleCourse,
        "Dual lane racing with pop-ups, tunnels, and a climb.",
        "Inflatable obstacle course with crawl-through tunnels, pop-up barriers, and a climb wall with slide",
        [obstacleCourse, gymObstacleCourse],
      ),
      item(
        "65ft-obstacle-course",
        "65' Mega Obstacle Course",
        749,
        "15' W x 65' L x 16' H",
        "Ages 6+",
        megaObstacleCourse,
        "Our longest course — a true main attraction.",
        "Extra-long multicolor inflatable obstacle course ending in a tall climb wall and slide tower",
        [megaObstacleCourse, parkEventAerial],
      ),
    ],
  },
  {
    slug: "interactive-games",
    name: "Interactive Games",
    image: gymMeltdown,
    alt: "Yellow and black Meltdown spinning-arm game and a matching inflatable game set up on a school gym floor",
    tagline: "Tournament ready",
    description:
      "Giant games and inflatable competitions that keep teens and adults engaged, not just the little kids.",
    items: [
      item(
        "giant-connect-four",
        "Giant Connect Four",
        129,
        "6' W x 6' H",
        "All ages",
        games,
        "Simple, addictive, and always busy.",
        "Giant Connect Four game board sized for outdoor events",
      ),
      item(
        "bungee-basketball",
        "Bungee Basketball",
        399,
        "20' W x 25' L x 12' H",
        "Ages 8+",
        games,
        "Two players, two hoops, one bungee cord.",
        "Bungee basketball inflatable with two lanes and a hoop at each end",
      ),
      item(
        "wrecking-ball",
        "Inflatable Wrecking Ball",
        499,
        "24' W x 24' L x 10' H",
        "Ages 8+",
        gymGameLineup,
        "Four pedestals and one very large ball.",
        "Inflatable wrecking ball game with pedestals, alongside a soccer arena and obstacle course in a gym",
        [gymGameLineup, gymMeltdown],
      ),
    ],
  },
  {
    slug: "golf-games",
    name: "Golf Games",
    image: games,
    alt: "Portable inflatable golf attraction set up for a corporate event",
    tagline: "Corporate hit",
    description: "Portable golf attractions for company outings, fundraisers, and city festivals.",
    items: [
      item(
        "golf-darts",
        "Inflatable Golf Darts",
        349,
        "20' target",
        "Ages 10+",
        games,
        "Velcro golf balls, giant dartboard, instant leaderboard.",
        "Inflatable golf dart target with velcro golf balls",
      ),
      item(
        "putting-challenge",
        "Putting Challenge",
        249,
        "8' x 20'",
        "All ages",
        games,
        "A tidy footprint for indoor corporate events.",
        "Portable putting challenge green sized for indoor corporate events",
      ),
    ],
  },
  {
    slug: "mechanical-rides",
    name: "Mechanical Rides",
    image: carnivalRide,
    alt: "Green and grey Phantom's Revenge swinging carnival ride loaded with riders at an outdoor festival",
    tagline: "Extreme attractions",
    description:
      "Mechanical bull, rock climbing wall, and other extreme attractions — all delivered with a trained operator.",
    items: [
      item(
        "mechanical-bull",
        "Mechanical Bull",
        995,
        "24' x 24' area",
        "Ages 8+",
        mechanical,
        "Operator included. Speed adjusts for every rider.",
        "Mechanical bull ride with a padded landing mat and operator station",
      ),
      item(
        "rock-climbing-wall",
        "Rock Climbing Wall",
        1195,
        "Needs 30' clearance",
        "Ages 6+",
        rockWall,
        "Four-sided tower with auto-belay and staff.",
        "Two children climbing a rock-textured climbing wall tower on auto-belay lines with a staff spotter below",
        [rockWall, minneapolisEvent],
      ),
    ],
  },
  {
    slug: "concessions",
    name: "Concessions",
    image: cottonCandy,
    alt: "Three kids eating pink cotton candy in front of a gold cotton candy machine at a party",
    tagline: "Add the smells",
    description:
      "Cotton candy, popcorn, snow cones, and nacho machines — supplies available by the serving count.",
    items: [
      item(
        "cotton-candy",
        "Cotton Candy Machine",
        89,
        "Table top",
        "All ages",
        cottonCandy,
        "Includes cart, floss sugar, and cones for 50.",
        "Kids eating fresh pink cotton candy beside a gold-domed cotton candy machine",
      ),
      item(
        "popcorn-machine",
        "Popcorn Machine",
        89,
        "Table top",
        "All ages",
        concessions,
        "Kettle corn smell that pulls a crowd.",
        "Tabletop popcorn machine with a kettle and warming cabinet",
      ),
      item(
        "snow-cone",
        "Snow Cone Machine",
        99,
        "Table top",
        "All ages",
        concessions,
        "Three syrup flavors and cups for 50.",
        "Tabletop snow cone machine with syrup bottles and paper cups",
      ),
    ],
  },
  {
    slug: "tents",
    name: "Tents",
    image: capitolTents,
    alt: "Two white high-peak frame tents set up on the lawn in front of the Minnesota State Capitol on an overcast day",
    tagline: "Shade & shelter",
    description:
      "Frame and pole tents plus tables and chairs — Minnesota weather changes fast, so plan for shade and rain.",
    items: [
      item(
        "20x20-frame-tent",
        "20' x 20' Frame Tent",
        349,
        "400 sq ft",
        "—",
        frameTents,
        "Seats about 32 guests at round tables.",
        "White high-peak frame tent shading rows of folding tables and black chairs on a paved lot",
        [frameTents, capitolTents],
      ),
      item(
        "20x40-frame-tent",
        "20' x 40' Frame Tent",
        599,
        "800 sq ft",
        "—",
        capitolTents,
        "The workhorse for graduation parties.",
        "Pair of large white frame tents joined together on a grass lawn at a public event",
        [capitolTents, frameTents],
      ),
      item(
        "10x10-pop-up",
        "10' x 10' Pop-Up Canopy",
        99,
        "100 sq ft",
        "—",
        tent,
        "Perfect over a concession or check-in table.",
        "White 10 by 10 foot pop-up canopy over an event check-in table",
      ),
    ],
  },
  {
    slug: "event-entertainers",
    name: "Event Entertainers",
    image: entertainers,
    alt: "Event entertainer working with a line of children at a party",
    tagline: "People power",
    description:
      "Face painters, balloon artists, magicians, and costumed characters to round out your event lineup.",
    items: [
      item(
        "face-painter",
        "Face Painter",
        225,
        "Per 2 hours",
        "All ages",
        entertainers,
        "Hypoallergenic paints and fast, friendly artists.",
        "Face painter decorating a child's cheek at an outdoor event",
      ),
      item(
        "balloon-artist",
        "Balloon Artist",
        225,
        "Per 2 hours",
        "All ages",
        entertainers,
        "Twists a line of kids into happy customers.",
        "Balloon artist twisting balloon animals for a line of children",
      ),
      item(
        "costumed-character",
        "Costumed Character",
        275,
        "Per hour",
        "Ages 2–10",
        entertainers,
        "Photo-ready visits for birthdays and festivals.",
        "Costumed character greeting young guests at a birthday party",
      ),
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export const homeCategorySlugs = [
  "bounce-houses",
  "water-slides",
  "bounce-house-with-slide",
  "obstacle-courses",
  "interactive-games",
  "tents",
  "concessions",
  "event-entertainers",
  "mechanical-rides",
];

export type EventType = {
  slug: string;
  name: string;
  blurb: string;
  detail: string;
  useCases: string[];
  categories: string[];
};

export const eventTypes: EventType[] = [
  {
    slug: "school-events",
    name: "School Events",
    blurb: "Field days, carnivals, and end-of-year celebrations for Twin Cities schools.",
    detail:
      "We work with public and private schools across Minneapolis, St. Paul, and the suburbs. Certificates of insurance are provided for your district, and our crews deliver on your schedule so setup never interrupts class.",
    useCases: ["Field day", "Fun run and carnival", "Grad party", "PTA fundraiser"],
    categories: ["obstacle-courses", "interactive-games", "bounce-houses"],
  },
  {
    slug: "church-events",
    name: "Church Events",
    blurb: "Vacation Bible School, fall festivals, and community outreach days.",
    detail:
      "Churches across the metro book us for VBS weeks and fall festivals. We can deliver Friday for a Saturday event and pick up Monday at no extra charge on most weekends.",
    useCases: ["VBS week", "Fall festival", "Trunk or treat", "Outreach picnic"],
    categories: ["bounce-houses", "concessions", "event-entertainers"],
  },
  {
    slug: "corporate-events",
    name: "Corporate Events",
    blurb: "Company picnics, employee appreciation days, and client open houses.",
    detail:
      "From a 50-person team lunch to a 5,000-guest campus picnic, we bring attractions that pull adults in too — mechanical bull, golf darts, and bungee basketball are perennial favorites.",
    useCases: ["Company picnic", "Employee appreciation", "Grand opening", "Trade show draw"],
    categories: ["mechanical-rides", "golf-games", "tents"],
  },
  {
    slug: "city-events",
    name: "City Events & Festivals",
    blurb: "Park district programs, Nights to Unite, and community festivals.",
    detail:
      "Park deliveries require our 1-hour window delivery so your permit times are covered. We carry the insurance limits most Minnesota cities require and can be added as an additional insured.",
    useCases: ["Night to Unite", "Park district program", "Summer festival", "Parade day"],
    categories: ["water-slides", "obstacle-courses", "event-entertainers"],
  },
];

export const publicEvents = [
  "Boom Island Park — Minneapolis",
  "Andover Family Fun Fest",
  "Maple Grove Days",
  "St. Paul Parks summer series",
  "Blaine Blazin' 4th",
  "Woodbury Days",
];

export type ServiceCity = {
  name: string;
  free: boolean;
  note: string;
};

/**
 * Delivery pricing hubs used to tier an arbitrary customer address.
 *
 * A customer's city does not have to appear in `serviceCities` — we geocode
 * whatever they type and apply the rules of the nearest hub within its radius.
 * Radii are tuned so the existing `serviceCities` tiers reproduce exactly:
 * metro suburbs land inside the Twin Cities hub, the St. Cloud cluster lands
 * inside the St. Cloud hub, and outer towns like Monticello, Northfield,
 * Hutchinson, and River Falls fall through to the extended tier.
 */
export type ServiceArea = {
  /** Hub name shown to the customer. */
  name: string;
  lat: number;
  lng: number;
  /** Addresses within this many miles of the hub belong to this area. */
  radiusMiles: number;
  /** Standard delivery is free once the item subtotal reaches this amount. */
  freeDeliveryThreshold: number;
  /** Flat standard-delivery fee charged below the threshold. */
  standardFee: number;
  note: string;
};

export const serviceAreas: ServiceArea[] = [
  {
    name: "Twin Cities Metro",
    lat: 44.9778,
    lng: -93.265,
    radiusMiles: 30,
    freeDeliveryThreshold: 175,
    standardFee: 49,
    note: "Free standard delivery on orders $175+",
  },
  {
    name: "St. Cloud",
    lat: 45.5579,
    lng: -94.1632,
    radiusMiles: 20,
    freeDeliveryThreshold: 300,
    standardFee: 49,
    note: "$300 subtotal minimum for free standard delivery",
  },
];

/**
 * Fallback tier for addresses outside every hub radius but still drivable.
 * Matches the "$250 subtotal minimum + delivery fee" cities in `serviceCities`.
 */
export const extendedServiceArea = {
  name: "Extended Service Area",
  radiusMiles: 75,
  freeDeliveryThreshold: 250,
  standardFee: 49,
  note: "$250 subtotal minimum for free standard delivery",
} as const;

export const serviceCities: ServiceCity[] = [
  { name: "Minneapolis", free: true, note: "Free delivery on orders $175+" },
  { name: "St. Paul", free: true, note: "Free delivery on orders $175+" },
  { name: "Bloomington", free: true, note: "Free delivery on orders $175+" },
  { name: "Minnetonka", free: true, note: "Free delivery on orders $175+" },
  { name: "Maple Grove", free: true, note: "Free delivery on orders $175+" },
  { name: "Woodbury", free: true, note: "Free delivery on orders $175+" },
  { name: "Eagan", free: true, note: "Free delivery on orders $175+" },
  { name: "Edina", free: true, note: "Free delivery on orders $175+" },
  { name: "Plymouth", free: true, note: "Free delivery on orders $175+" },
  { name: "Brooklyn Park", free: true, note: "Free delivery on orders $175+" },
  { name: "Coon Rapids", free: true, note: "Free delivery on orders $175+" },
  { name: "Blaine", free: true, note: "Free delivery on orders $175+" },
  { name: "Eden Prairie", free: true, note: "Free delivery on orders $175+" },
  { name: "Burnsville", free: true, note: "Free delivery on orders $175+" },
  { name: "Apple Valley", free: true, note: "Free delivery on orders $175+" },
  { name: "Lakeville", free: true, note: "Free delivery on orders $175+" },
  { name: "Roseville", free: true, note: "Free delivery on orders $175+" },
  { name: "Shakopee", free: true, note: "Free delivery on orders $175+" },
  { name: "Chanhassen", free: true, note: "Free delivery on orders $175+" },
  { name: "Andover", free: true, note: "Free delivery on orders $175+" },
  { name: "St. Cloud", free: false, note: "$300 subtotal minimum + delivery fee" },
  { name: "Sartell", free: false, note: "$300 subtotal minimum + delivery fee" },
  { name: "Sauk Rapids", free: false, note: "$300 subtotal minimum + delivery fee" },
  { name: "Waite Park", free: false, note: "$300 subtotal minimum + delivery fee" },
  { name: "Monticello", free: false, note: "$250 subtotal minimum + delivery fee" },
  { name: "Northfield", free: false, note: "$250 subtotal minimum + delivery fee" },
  { name: "Hutchinson", free: false, note: "$250 subtotal minimum + delivery fee" },
  { name: "River Falls, WI", free: false, note: "$250 subtotal minimum + delivery fee" },
];

export const faqs = [
  {
    q: "Does the price include delivery and setup?",
    a: "Yes. Every rental price includes delivery, setup, takedown, and pickup. Standard delivery is free on orders over $175 in the Twin Cities metro, and orders over $300 in the St. Cloud area.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Give us 24 hours' notice and you can cancel or reschedule with no penalty. If sustained winds exceed 20 mph or severe weather is forecast, we will contact you to move the date — safety comes first and you are never charged for weather cancellations we call.",
  },
  {
    q: "Is a deposit required?",
    a: "A 50% deposit holds your date, and the balance is due before setup. You can also pay in full online at checkout, 24/7.",
  },
  {
    q: "What surfaces can you set up on?",
    a: "Grass is preferred and always free to stake. We can also set up on asphalt, concrete, or indoor gym floors using sandbags. We cannot set up on sand, gravel, or rocky ground.",
  },
  {
    q: "Do you offer extended rental discounts?",
    a: "Yes. Multi-day and weekend-long rentals are discounted, and most Friday deliveries can stay through Sunday for a small add-on. Ask when you book.",
  },
  {
    q: "Will it fit in my backyard?",
    a: "Check the dimensions on each product page and add 5 feet of clearance on all sides. Units must be at least 20 feet away from power lines, and we need a clear 3-foot gate or path to get equipment into the yard.",
  },
  {
    q: "Is the equipment cleaned between rentals?",
    a: "Every unit is cleaned and sanitized after each rental. We use commercial-grade vinyl inflatables and inspect them before every delivery.",
  },
  {
    q: "Are you insured?",
    a: "Yes — Jump City is fully insured, and we can provide a certificate of insurance for your school, church, city, or venue on request.",
  },
];

export const deliveryOptions = [
  {
    name: "Standard Delivery",
    price: "Free",
    sub: "on orders over $175 (metro)",
    detail: "We deliver 12–48 hours ahead of your event and pick up the next business day.",
    highlight: false,
  },
  {
    name: "Event Day Delivery",
    price: "$49",
    sub: "delivered as early as 11am",
    detail: "Same-day delivery window for events where the equipment can't sit overnight.",
    highlight: true,
  },
  {
    name: "1-Hour Window Delivery",
    price: "$79",
    sub: "required for park deliveries",
    detail: "A guaranteed one-hour arrival window so you can meet permit and park times.",
    highlight: false,
  },
];

export const blogPosts = [
  {
    slug: "backyard-party-checklist",
    title: "The Minneapolis Backyard Party Checklist",
    date: "June 12, 2025",
    excerpt:
      "Power, clearance, gates, and shade — the six things to check before your bounce house arrives.",
  },
  {
    slug: "wet-or-dry",
    title: "Wet or Dry? Picking the Right Slide for a Minnesota Summer",
    date: "May 28, 2025",
    excerpt: "Our short summer means timing matters. Here's how we help families decide.",
  },
  {
    slug: "school-field-day-guide",
    title: "Planning a School Field Day in the Twin Cities",
    date: "April 9, 2025",
    excerpt:
      "Rotation schedules, insurance certificates, and how many attractions you actually need.",
  },
  {
    slug: "park-permits",
    title: "Park Permits and Inflatables: What Cities Require",
    date: "March 3, 2025",
    excerpt: "Why park events need a 1-hour delivery window and a certificate of insurance.",
  },
];
