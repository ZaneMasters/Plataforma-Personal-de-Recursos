export interface Link {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  category: string;
  subcategory: string;
  featured?: boolean;
  modifiedAt?: string;
  isFavorite?: boolean;
  userId?: string;
}
