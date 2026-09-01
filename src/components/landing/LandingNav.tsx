import { Link } from 'react-router-dom';
import LandingLogo from './LandingLogo';

const LandingNav = () => {
  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[hsl(var(--marketing-surface-alt))] border-b border-[hsl(var(--marketing-border))] text-[hsl(var(--marketing-text-muted))] text-center text-[11px] font-mono py-2 px-4">
        <Link to="/#openclaw" className="inline-flex items-center gap-2 hover:text-[hsl(var(--marketing-text))] transition-colors uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--marketing-warning))] animate-pulse" />
          <span>NEW · OpenClaw Integration</span>
        </Link>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface))]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <LandingLogo />
          <nav className="hidden md:flex items-center gap-6 text-sm text-[hsl(var(--marketing-text-muted))]">
            <Link to="/#features" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Features</Link>
            <Link to="/#openclaw" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Integrations</Link>
            <Link to="/#how-it-works" className="hover:text-[hsl(var(--marketing-text))] transition-colors">How it works</Link>
            <Link to="/#pricing" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Pricing</Link>
            <Link to="/blog" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="hidden sm:inline-flex px-3 py-1.5 text-sm text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="px-3 py-1.5 bg-[hsl(var(--marketing-accent))] text-[hsl(var(--marketing-accent-foreground))] text-xs font-bold rounded-sm hover:brightness-110 transition-all"
            >
              START FREE
            </Link>
          </div>
        </div>
      </header>
    </>
  );
};
export default LandingNav;
