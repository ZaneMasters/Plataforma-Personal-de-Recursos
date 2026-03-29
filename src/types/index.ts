export interface Link {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  category: string;
  tags: string[];
  featured?: boolean;
  modifiedAt?: string;
  isFavorite?: boolean;
  userId?: string;
}
