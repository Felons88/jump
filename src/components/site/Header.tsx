import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, ChevronDown, CalendarCheck, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { CartDrawer } from "@/components/site/CartDrawer";
import { eventTypes, PHONE, PHONE_HREF } from "@/data/site";

const aboutLinks = [
  { label: "About Us", to: "/about" },
  { label: "FAQs", to: "/faqs" },
  { label: "Blog & Media Room", to: "/blog" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="gradient-band text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-bold sm:text-sm">
          Free delivery &amp; setup on Twin Cities orders over $175 · 15+ years · Fully insured
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 lg:flex lg:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
            JC
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-lg font-extrabold">Jump City</span>
            <span className="block truncate text-[11px] font-semibold text-muted-foreground">
              Inflatable Rentals · Minneapolis
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            to="/rentals"
            className="rounded-full px-3 py-2 text-sm font-bold hover:bg-muted"
            activeProps={{ className: "text-primary" }}
          >
            Rentals
          </Link>
          <NavDropdown
            label="Events"
            items={[
              ...eventTypes.map((e) => ({
                label: e.name,
                to: "/events/$slug",
                params: { slug: e.slug },
              })),
              { label: "Public Events We've Powered", to: "/events" },
            ]}
          />
          <Link
            to="/service-areas"
            className="rounded-full px-3 py-2 text-sm font-bold hover:bg-muted"
            activeProps={{ className: "text-primary" }}
          >
            Service Areas
          </Link>
          <NavDropdown label="About" items={aboutLinks} />
          <Link
            to="/contact"
            className="rounded-full px-3 py-2 text-sm font-bold hover:bg-muted"
            activeProps={{ className: "text-primary" }}
          >
            Contact
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <CartDrawer />
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link to="/demo-admin">
              <LayoutDashboard className="size-4" />
              Check your dates
            </Link>
          </Button>
          <a
            href={PHONE_HREF}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-extrabold text-secondary hover:bg-muted sm:flex"
          >
            <Phone className="size-4" />
            {PHONE}
          </a>
          <Button asChild variant="default" size="sm" className="hidden sm:inline-flex">
            <Link to="/contact">
              <CalendarCheck className="size-4" />
              Check Your Date
            </Link>
          </Button>
          <a href={PHONE_HREF} className="sm:hidden" aria-label={`Call ${PHONE}`}>
            <Button variant="secondary" size="icon">
              <Phone className="size-4" />
            </Button>
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] overflow-y-auto sm:w-96">
              <SheetTitle className="font-display text-xl">Menu</SheetTitle>
              <div className="mt-4 space-y-6 pb-16">
                <MobileGroup title="Rentals">
                  <Link
                    to="/rentals"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Browse all rentals
                  </Link>
                </MobileGroup>
                <MobileGroup title="Events">
                  {eventTypes.map((e) => (
                    <Link
                      key={e.slug}
                      to="/events/$slug"
                      params={{ slug: e.slug }}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      {e.name}
                    </Link>
                  ))}
                  <Link
                    to="/events"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Public Events We've Powered
                  </Link>
                </MobileGroup>
                <MobileGroup title="More">
                  <Link
                    to="/service-areas"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Service Areas
                  </Link>
                  {aboutLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <Link
                    to="/contact"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2 text-sm font-semibold hover:bg-muted"
                  >
                    Contact
                  </Link>
                </MobileGroup>
                <Button asChild size="lg" className="w-full">
                  <Link to="/contact" onClick={() => setOpen(false)}>
                    Check Your Date
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/demo-admin" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="size-4" />
                    Check your dates
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function MobileGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 px-2 font-display text-sm font-extrabold uppercase tracking-wide text-primary">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

type NavItem = { label: string; to: string; params?: Record<string, string> };

function NavDropdown({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-sm font-bold outline-none hover:bg-muted data-[state=open]:bg-muted">
        {label}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-[70vh] w-64 overflow-y-auto">
        {items.map((item) => (
          <DropdownMenuItem key={item.label} asChild>
            <Link
              to={item.to}
              params={item.params as never}
              className="cursor-pointer text-sm font-semibold"
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
