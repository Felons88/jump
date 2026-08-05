import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Linkedin, Star, Phone, Mail, MapPin } from "lucide-react";
import { EMAIL, PHONE, PHONE_HREF, serviceCities } from "@/data/site";

const socials = [
  { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { label: "YouTube", icon: Youtube, href: "https://youtube.com" },
  { label: "Yelp", icon: Star, href: "https://yelp.com" },
  { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
];

export function Footer() {
  const topCities = serviceCities.slice(0, 10);

  return (
    <footer className="mt-20 border-t-4 border-primary bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary font-black text-primary-foreground">
              JC
            </span>
            <span className="font-display text-xl font-extrabold">Jump City</span>
          </div>
          <p className="mt-3 text-sm opacity-90">
            Family owned and operated inflatable and party rentals serving the Minneapolis/St. Paul
            metro and St. Cloud for 15+ years. Delivery, setup, and pickup included.
          </p>
          <div className="mt-4 space-y-2 text-sm font-semibold">
            <p className="flex items-center gap-2">
              <MapPin className="size-4" /> Minneapolis, MN
            </p>
            <a href={PHONE_HREF} className="flex items-center gap-2 hover:underline">
              <Phone className="size-4" /> {PHONE}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 break-all hover:underline"
            >
              <Mail className="size-4" /> {EMAIL}
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm font-semibold opacity-90">
            <li>
              <Link to="/blog" className="hover:underline">
                Blog & Media Room
              </Link>
            </li>
            <li>
              <Link to="/faqs" className="hover:underline">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="/service-areas" className="hover:underline">
                Delivery Areas
              </Link>
            </li>
            <li>
              <Link to="/events" className="hover:underline">
                Events We Serve
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:underline">
                Terms &amp; Rental Agreement
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg">Cities We Serve</h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm font-semibold opacity-90">
            {topCities.map((c) => (
              <li key={c.name}>{c.name}</li>
            ))}
          </ul>
          <Link to="/service-areas" className="mt-3 inline-block text-sm font-extrabold underline">
            See all delivery areas
          </Link>
        </div>

        <div>
          <h3 className="font-display text-lg">Follow the Fun</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noreferrer"
                className="grid size-10 place-items-center rounded-full bg-secondary-foreground/15 transition hover:bg-secondary-foreground/25"
              >
                <s.icon className="size-5" />
              </a>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold opacity-90">
            Fully insured · Cleaned &amp; sanitized between every rental · Commercial-grade vinyl
          </p>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/20 py-5 text-center text-xs font-semibold opacity-80">
        © {new Date().getFullYear()} Jump City Inflatable Rentals · Minneapolis, Minnesota
      </div>
    </footer>
  );
}
