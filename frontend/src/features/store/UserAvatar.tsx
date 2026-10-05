import * as React from "react";
import { User } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface UserAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  className?: string;
  iconClassName?: string;
}

export function UserAvatar({
  src,
  alt,
  name,
  className,
  iconClassName,
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || name || "Usuario"}
        onError={() => setImageError(true)}
        className={cn(
          "w-7 h-7 rounded-full object-cover shrink-0 border border-[#E2E8F0]",
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-7 h-7 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] flex items-center justify-center shrink-0",
        className,
      )}
      title={name}
      aria-label={name || "Usuario"}
    >
      <User className={cn("w-3.5 h-3.5", iconClassName)} />
    </div>
  );
}

export default UserAvatar;
