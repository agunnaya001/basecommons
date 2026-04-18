import { ReactNode } from "react";
import { Link } from "wouter";
import { Nav } from "./nav";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans bg-background text-foreground relative selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      <Nav />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t border-border mt-24 bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
                  <path d="M50 10 L89 32.5 V77.5 L50 90 L11 77.5 V32.5 L50 10Z" stroke="hsl(var(--primary))" strokeWidth="3"/>
                  <path d="M50 85 V50" stroke="hsl(var(--secondary))" strokeWidth="5" strokeLinecap="round"/>
                  <path d="M50 70 C 35 70, 25 55, 25 40 C 35 45, 45 55, 50 65" fill="hsl(var(--secondary))"/>
                  <path d="M50 65 C 60 55, 70 45, 80 40 C 80 55, 70 70, 50 70" fill="hsl(var(--primary))"/>
                </svg>
                <span className="font-bold text-foreground">BaseCommons</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Quadratic funding for public goods on Base. Every small donation is amplified by the power of community.
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                <span>Built on</span>
                <span className="font-bold text-[#0052FF]">Base</span>
                <span>· Open source</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Platform</h4>
              <div className="flex flex-col gap-2">
                {[
                  { href: "/", label: "Explore Projects" },
                  { href: "/create", label: "Submit a Project" },
                  { href: "/how-it-works", label: "How It Works" },
                  { href: "/admin", label: "Admin Panel" },
                ].map(link => (
                  <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Resources</h4>
              <div className="flex flex-col gap-2">
                {[
                  { href: "https://github.com/agunnaya001/basecommons", label: "GitHub Repository" },
                  { href: "https://base.org", label: "Base L2" },
                  { href: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3243656", label: "QF Research Paper" },
                  { href: "https://gitcoin.co", label: "Gitcoin (QF Pioneer)" },
                ].map(link => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>© 2026 BaseCommons · MIT License · Built by <a href="https://github.com/agunnaya001" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">agunnaya001</a></span>
            <span className="flex items-center gap-1">
              🌱 Every drop makes an ocean
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}