import agntfindLogo from '@/assets/agntfind-logo.png';

const footerLinks = {
  Product: ['Features', 'Integrations', 'Pricing', 'Changelog'],
  Resources: ['Documentation', 'API Reference', 'Blog', 'Community'],
  Company: ['About', 'Careers', 'Contact', 'Press'],
  Legal: ['Privacy', 'Terms', 'Security'],
};

const LandingFooter = () => (
  <footer className="border-t border-border/40 pt-16 pb-10 bg-[hsl(var(--marketing-surface))]">
    <div className="mx-auto max-w-6xl px-6">
      <div className="grid gap-8 md:grid-cols-5">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <img src={agntfindLogo} alt="Agntive" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-bold text-[hsl(var(--marketing-text))]">
              Agntive<span className="text-[hsl(var(--marketing-accent))]">.ai</span>
            </span>
          </div>
          <p className="text-sm text-[hsl(var(--marketing-text-muted))] max-w-xs leading-relaxed">
            The project management platform built for AI-first teams. Track agents, monitor tokens, ship faster.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-[hsl(var(--marketing-text))] mb-4">{category}</h4>
            <ul className="space-y-2.5">
              {links.map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-[hsl(var(--marketing-text-muted))] hover:text-[hsl(var(--marketing-text))] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[hsl(var(--marketing-text-muted))]">
          © {new Date().getFullYear()} Agntive. All rights reserved.
        </p>
        <div className="flex gap-4 text-xs text-[hsl(var(--marketing-text-muted))]">
          <a href="#" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Twitter</a>
          <a href="#" className="hover:text-[hsl(var(--marketing-text))] transition-colors">GitHub</a>
          <a href="#" className="hover:text-[hsl(var(--marketing-text))] transition-colors">Discord</a>
        </div>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
