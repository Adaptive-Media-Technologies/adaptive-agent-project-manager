import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';

const FinalCTA = () => (
  <section className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="relative overflow-hidden border border-[hsl(var(--marketing-border))] bg-[hsl(var(--marketing-surface-alt))] p-12 md:p-20 text-center">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(hsl(var(--marketing-text-muted)) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative">
          <div className="inline-block px-2 py-1 mb-4 border border-[hsl(var(--marketing-border))] text-[10px] font-mono tracking-widest text-[hsl(var(--marketing-text-muted))]">
            READY_TO_DEPLOY
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-[hsl(var(--marketing-text))]">
            Unify your team and AI agents.
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--marketing-text-muted))] max-w-lg mx-auto">
            One instrument-grade workspace. Replace the scattered stack.
          </p>
          <Link to="/auth" className="mt-8 inline-flex">
            <Button size="lg" className="h-12 px-8 text-sm font-bold tracking-wide rounded-sm bg-[hsl(var(--marketing-text))] text-[hsl(var(--marketing-surface))] hover:bg-white">
              START FREE <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCTA;
