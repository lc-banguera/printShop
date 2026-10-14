import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/shared/components/Container/Container";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="w-full border-b border-borderMuted bg-surface py-3">
      <Container variant="wide">
        <ol className="flex flex-wrap items-center gap-1 text-[11px] text-foregroundMuted sm:text-xs">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-foregroundSubtle" />}
                {item.href && !isLast ? (
                  <Link to={item.href} className="transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "max-w-[220px] truncate font-medium text-foreground sm:max-w-none" : ""}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
};

export default Breadcrumb;
