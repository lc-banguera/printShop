import * as React from 'react';
import { Header, Logo } from '@/features/landing/components/Header';
import { Footer } from '@/features/landing/components/Footer';
import { Package } from 'lucide-react';
import '../design-marketplace.css';

type DesignMarketplaceShellProps = {
  children: React.ReactNode;
  variant?: 'public' | 'creator';
};

export function DesignMarketplaceShell({ children, variant = 'public' }: DesignMarketplaceShellProps) {
  if (variant === 'public') {
    return (
      <div className="design-marketplace-public-shell min-h-screen bg-background text-foreground">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    );
  }

  return <CreatorMarketplaceShell>{children}</CreatorMarketplaceShell>;
}

function CreatorMarketplaceShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="design-marketplace-shell min-h-screen bg-background text-foreground">
      <header className="marketplace-creator-header">
        <div className="marketplace-header-inner">
          <Logo aria-label="PrintShop, inicio" />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}

export function MarketplaceSectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="marketplace-section-heading">
      <div>
        {eyebrow ? <p className="marketplace-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="marketplace-heading-action">{action}</div> : null}
    </div>
  );
}

export function MarketplaceNotice({ tone = 'neutral', children }: { tone?: 'neutral' | 'success' | 'error'; children: React.ReactNode }) {
  return <div className={`marketplace-notice marketplace-notice-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>;
}

export function MarketplacePageIcon({ children }: { children: React.ReactNode }) {
  return <div className="marketplace-page-icon" aria-hidden="true"><Package />{children}</div>;
}
