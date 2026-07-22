import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const LandingNav = () => {
  const { theme, setTheme } = useTheme();
  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[hsl(var(--marketing-surface))] border-b border-[hsl(var(--marketing-border))] text-[hsl(var(--marketing-text-muted))] text-center text-[11px] font-mono py-2 px-4">
        <a href="#openclaw" className="inline-flex items-center gap-2 hover:text-[hsl(var(--marketing-text))] transition-colors uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--marketing-accent))] animate-pulse" />
          <span>NEW · OpenClaw Integration</span>
        </a>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface))]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[hsl(var(--marketing-text))] rounded-sm" />
            <span className="font-display text-lg font-bold tracking-tight text-[hsl(var(--marketing-text))]">
              Agntive
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[hsl(var(--marketing-text-muted))]">
            <a href="#features" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Features</a>
            <a href="#openclaw" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Integrations</a>
            <a href="#how-it-works" className="hover:text-[hsl(var(--marketing-text))] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Pricing</a>
            <Link to="/blog" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-sm text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] hover:bg-white/5 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              to="/auth"
              className="hidden sm:inline-flex px-3 py-1.5 text-sm text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/auth"
              className="px-3 py-1.5 bg-[hsl(var(--marketing-text))] text-[hsl(var(--marketing-surface))] text-xs font-bold rounded-sm hover:bg-white transition-colors"
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
