import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';

const FinalCTA = () => (
  <section className="py-20 md:py-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[hsl(var(--marketing-gradient-start))] via-[hsl(var(--marketing-gradient-mid))] to-[hsl(var(--marketing-gradient-end))] p-12 md:p-20 text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZyIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-30" />
        <div className="relative">
          <Zap size={40} className="mx-auto mb-4 text-white/80" />
          <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to unify your team and AI agents?</h2>
          <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
            Join teams already using Agntive to replace scattered tools with one smart workspace.
          </p>
          <Link to="/auth" className="mt-8 inline-block">
            <Button size="lg" className="h-12 px-8 text-base bg-white text-[hsl(var(--marketing-accent))] hover:bg-white/90 shadow-xl">
              Start 14-Day Free Trial <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default FinalCTA;
