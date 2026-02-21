import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import agntfindLogo from '@/assets/agntfind-logo.png';

const LandingNav = () => (
  <>
    {/* Announcement Bar */}
    <div className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] text-white text-center text-sm py-2 px-4">
      <a href="#openclaw" className="inline-flex items-center gap-2 hover:underline">
        <Sparkles size={14} />
        <span className="font-medium">NEW: OpenClaw Integration</span>
        <span className="hidden sm:inline">— One workspace for your team and AI agents</span>
      </a>
    </div>

    {/* Nav */}
    <header className="sticky top-0 z-50 border-b border-border/40 bg-[hsl(var(--marketing-surface))/0.85] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={agntfindLogo} alt="Agntive" className="h-8 w-8 rounded-xl" />
          <span className="text-lg font-bold tracking-tight text-[hsl(var(--marketing-text))]">
            Agntive<span className="text-[hsl(var(--marketing-accent))]">.ai</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[hsl(var(--marketing-text-muted))]">
          <a href="#features" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Features</a>
          <a href="#openclaw" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Integrations</a>
          <a href="#how-it-works" className="hover:text-[hsl(var(--marketing-text))] transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] text-white border-0 shadow-lg shadow-[hsl(var(--marketing-accent))/0.25] hover:shadow-xl hover:shadow-[hsl(var(--marketing-accent))/0.35] transition-all">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </div>
    </header>
  </>
);

export default LandingNav;
