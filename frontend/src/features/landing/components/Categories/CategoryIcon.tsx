import * as React from 'react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-7 h-7' }) => {
  const strokeWidth = 1.75;

  switch (iconName) {
    // 1. Camisetas: Simple front-view t-shirt outline with round collar and sleeves
    case 'Shirt':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4l3 2a3 3 0 0 0 6 0l3-2 4 4-3 3v10H5V11L2 8l4-4z" />
        </svg>
      );

    // 2. Hoodies: Hoodie with hood neckline, hood contour lines and drawstrings
    case 'Hoodie':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3h7A2.5 2.5 0 0 1 18 5.5V7l4 3-2.5 5.5-2.5-.8V21H7V14.7l-2.5.8L2 10l4-3V5.5z" />
          <path d="M9 3v3a3 3 0 0 0 6 0V3" />
          <line x1="10.5" y1="8.5" x2="10.5" y2="12.5" />
          <line x1="13.5" y1="8.5" x2="13.5" y2="12.5" />
        </svg>
      );

    // 3. Tazas: Coffee mug with handle on right side
    case 'Mug':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1" />
          <path d="M5 8h12v8a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8z" />
          <line x1="8" y1="4" x2="8.01" y2="5" />
          <line x1="12" y1="4" x2="12.01" y2="5" />
          <line x1="16" y1="4" x2="16.01" y2="5" />
        </svg>
      );

    // 4. Gorras: Curved baseball cap with visor extended to right
    case 'Cap':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 14a8 8 0 0 1 16 0" />
          <path d="M3 14.5h18.5a2.5 2.5 0 0 1 2.5 2.5v.5H3v-3z" />
          <circle cx="12" cy="6" r="1" fill="currentColor" />
          <path d="M12 6a8 8 0 0 0-4 7" strokeDasharray="1 2" />
        </svg>
      );

    // 5. Bolsas: Shopping bag with handles
    case 'ShoppingBag':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );

    // 6. Sudaderas: Folded sweatshirt/jacket icon with collar & long sleeves
    case 'Jacket':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l3 5-3 4-2-.5V21H8V11.5L6 12 3 8l3-5z" />
          <path d="M9 3v4a3 3 0 0 0 6 0V3" />
          <line x1="12" y1="7" x2="12" y2="21" />
        </svg>
      );

    // 7. Stickers: Peeled sticker label with turned corner
    case 'Sticker':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 15a5 5 0 0 1-5-5" />
          <path d="M22 12a10 10 0 0 1-10 10" />
          <path d="M12 22a10 10 0 0 0 10-10" />
        </svg>
      );

    // 8. Botellas: Tall bottle icon with neck and cap
    case 'Bottle':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="10" y="2" width="4" height="3" rx="0.5" />
          <path d="M9 5h6v3l2.5 3.5V20a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2V11.5L9 8V5z" />
          <line x1="6.5" y1="15" x2="17.5" y2="15" />
        </svg>
      );

    // 9. Accesorios: Crossed scissors with a ruler/pencil line matching reference
    case 'Scissors':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.47" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </svg>
      );

    // 10. Ver todos: 3x3 dotted/squared grid matching reference grid pictogram exactly
    case 'Grid3x3':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="4" height="4" rx="1" />
          <rect x="10" y="3" width="4" height="4" rx="1" />
          <rect x="17" y="3" width="4" height="4" rx="1" />
          <rect x="3" y="10" width="4" height="4" rx="1" />
          <rect x="10" y="10" width="4" height="4" rx="1" />
          <rect x="17" y="10" width="4" height="4" rx="1" />
          <rect x="3" y="17" width="4" height="4" rx="1" />
          <rect x="10" y="17" width="4" height="4" rx="1" />
          <rect x="17" y="17" width="4" height="4" rx="1" />
        </svg>
      );

    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4l3 2a3 3 0 0 0 6 0l3-2 4 4-3 3v10H5V11L2 8l4-4z" />
        </svg>
      );
  }
};
