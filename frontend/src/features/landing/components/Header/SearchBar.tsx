import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { headerData } from "../../data/header.data";

interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex h-11 w-full min-w-0 items-stretch overflow-hidden rounded-control border border-borderStrong bg-surface shadow-sm transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15",
        className,
      )}
      {...props}
    >
      <input
        type="text"
        placeholder={headerData.searchPlaceholder}
        className="h-full min-w-0 flex-1 border-0 bg-transparent pl-3 pr-2 text-xs text-foreground outline-none placeholder:text-foregroundSubtle sm:text-sm"
      />
      <button
        type="button"
        className="flex h-full w-11 min-w-[44px] shrink-0 items-center justify-center border-0 bg-primary text-primaryForeground transition-colors hover:bg-primaryHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        aria-label="Buscar"
      >
        <Search className="h-4 w-4 text-primaryForeground" />
      </button>
    </div>
  );
};

export default SearchBar;
