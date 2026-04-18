import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export function Nav() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Explore" },
    { href: "/create", label: "Submit Project" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5 L93.3013 30 V80 L50 95 L6.69873 80 V30 L50 5Z" fill="url(#hexGradient)" opacity="0.2"/>
            <path d="M50 10 L89 32.5 V77.5 L50 90 L11 77.5 V32.5 L50 10Z" stroke="hsl(var(--primary))" strokeWidth="2"/>
            <path d="M50 85 V50" stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round"/>
            <path d="M50 70 C 35 70, 25 55, 25 40 C 35 45, 45 55, 50 65" fill="hsl(var(--secondary))" opacity="0.8"/>
            <path d="M50 65 C 60 55, 70 45, 80 40 C 80 55, 70 70, 50 70" fill="hsl(var(--primary))" opacity="0.9"/>
            <circle cx="65" cy="30" r="5" fill="hsl(var(--primary))"/>
            <defs>
              <linearGradient id="hexGradient" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="hsl(var(--primary))" />
                <stop offset="1" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
          </svg>
          <span className="font-sans font-bold text-xl tracking-tight text-foreground">BaseCommons</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Button variant="default" className="rounded-full px-6 font-bold tracking-wide">
            Connect Wallet
          </Button>
        </div>

        {/* Mobile Nav Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-4 shadow-lg absolute w-full">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block text-lg font-medium transition-colors ${
                location === link.href ? "text-primary" : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Button className="w-full mt-4 rounded-full font-bold">Connect Wallet</Button>
        </div>
      )}
    </nav>
  );
}