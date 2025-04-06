// Define common types used throughout the application

export type ProductPrice = {
  id: string;
  tier_name: string | null;
  price: number;
  original_price: number | null;
  currency: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null; // Add image_url field
  icon: string | null;
  color: string | null; // Add color field
  display_order: number | null;
  created_at?: string; // Add created_at field
  // products?: Product[]; // Optional relation if needed elsewhere
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string | null; // Assuming image_url can be null
  active: boolean;
  featured: boolean;
  special: boolean;
  created_at?: string; // Optional timestamp
  category?: Category; // Optional related category data
  product_prices?: ProductPrice[]; // Optional related price data
};

export type Announcement = {
  id: string;
  title: string; // Make title required
  content: string;
  image_url: string | null; // Make image_url consistent
  type: 'ticker' | 'slide' | 'popup'; // Add popup type
  active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at?: string; // Optional timestamp
};
