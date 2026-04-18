import { ReactNode } from "react";
import { Nav } from "./nav";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans bg-background text-foreground relative selection:bg-primary/30">
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
      <Nav />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="border-t border-border mt-24 py-12 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p className="font-medium text-foreground mb-2">BaseCommons</p>
          <p>Public goods funding on Base. Every drop makes an ocean.</p>
        </div>
      </footer>
    </div>
  );
}