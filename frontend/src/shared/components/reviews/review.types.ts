export interface ReviewUser {
  name: string;
  avatar?: string;
  fallback?: string;
}

export interface ReviewItem {
  id: string;
  user: ReviewUser;
  rating: number;
  date: string;
  verifiedPurchase?: boolean;
  title?: string;
  comment: string;
  images?: string[];
  helpfulCount?: number;
}

export interface RatingDistributionItem {
  rating: number; // 5, 4, 3, 2, 1
  count: number;
  percent?: number; // 0 - 100
}

export type ReviewSortOption =
  | 'relevance'
  | 'recent'
  | 'highest'
  | 'lowest'
  | 'with_photos';

export interface ReviewSectionProps {
  title?: string;
  rating: number;
  totalReviews: number;
  distribution?: RatingDistributionItem[];
  reviews: ReviewItem[];
  emptyMessage?: string;
  className?: string;
}
