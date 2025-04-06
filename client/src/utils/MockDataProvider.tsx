import React, { createContext, useContext, ReactNode } from 'react';

// Define types for our data
type Product = {
  id: string;
  name: string;
  description: string;
  category_id: string;
  image_url: string;
  active: boolean;
  featured: boolean;
  special: boolean;
  category?: {
    name: string;
    icon: string;
  };
  product_prices: {
    id: string;
    tier_name: string | null;
    price: number;
    original_price: number | null;
    currency: string;
  }[];
};

type Category = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  icon: string;
  color: string;
  products?: Product[];
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  type: 'ticker' | 'slide' | 'popup';
  active: boolean;
  start_date: string | null;
  end_date: string | null;
};

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'GIS Sky Blue Shirt',
    description: 'Short sleeve sky blue shirt for GIS',
    category_id: '1',
    image_url: 'uniforms/shirt-ssleeve-gis-sky-blue.png', // Use DB Ref path
    active: true,
    featured: true,
    special: false,
    category: {
      name: 'School Uniforms',
      icon: 'shirt'
    },
    product_prices: [
      {
        id: '1',
        tier_name: 'Size 4',
        price: 149.99,
        original_price: null,
        currency: 'BWP'
      },
      {
        id: '2',
        tier_name: 'Size 6',
        price: 159.99,
        original_price: null,
        currency: 'BWP'
      },
      {
        id: '3',
        tier_name: 'Size 8',
        price: 169.99,
        original_price: null,
        currency: 'BWP'
      }
    ]
  },
  {
    id: '2',
    name: 'GIS Navy Jersey',
    description: 'Navy jersey with white stripes for GIS',
    category_id: '1',
    image_url: 'uniforms/jersey-navy-white-stripes-gis-hs.png', // Use DB Ref path
    active: true,
    featured: false,
    special: true,
    category: {
      name: 'School Uniforms',
      icon: 'shirt'
    },
    product_prices: [
      {
        id: '4',
        tier_name: 'Size 4',
        price: 249.99,
        original_price: 279.99,
        currency: 'BWP'
      },
      {
        id: '5',
        tier_name: 'Size 6',
        price: 259.99,
        original_price: 289.99,
        currency: 'BWP'
      }
    ]
  },
  {
    id: '3',
    name: 'BIC Cristal Blue Pen',
    description: 'Classic blue ballpoint pen',
    category_id: '2',
    image_url: 'products/pen-bic-cristal-blue.png', // Use DB Ref path
    active: true,
    featured: true,
    special: false,
    category: {
      name: 'Stationery',
      icon: 'pencil'
    },
    product_prices: [
      {
        id: '6',
        tier_name: null,
        price: 4.99,
        original_price: null,
        currency: 'BWP'
      }
    ]
  }
];

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'School Uniforms',
    description: 'School uniforms for various schools',
    image_url: '',
    icon: 'shirt',
    color: '#3b82f6',
    products: mockProducts.filter(p => p.category_id === '1')
  },
  {
    id: '2',
    name: 'Stationery',
    description: 'Pens, pencils, and other stationery items',
    image_url: '',
    icon: 'pencil',
    color: '#10b981',
    products: mockProducts.filter(p => p.category_id === '2')
  }
];

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Back to School Sale',
    content: 'Get up to 20% off on all school uniforms!',
    image_url: null,
    type: 'slide',
    active: true,
    start_date: '2025-01-01',
    end_date: '2025-02-28'
  },
  {
    id: '2',
    title: 'New Stationery Arrivals',
    content: 'Check out our new stationery collection!',
    image_url: null,
    type: 'ticker',
    active: true,
    start_date: null,
    end_date: null
  }
];

// Create context
type MockDataContextType = {
  products: Product[];
  categories: Category[];
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
};

const MockDataContext = createContext<MockDataContextType>({
  products: [],
  categories: [],
  announcements: [],
  loading: false,
  error: null
});

// Provider component
type MockDataProviderProps = {
  children: ReactNode;
};

export const MockDataProvider: React.FC<MockDataProviderProps> = ({ children }) => {
  // In a real app, we would fetch data from an API here
  const value = {
    products: mockProducts,
    categories: mockCategories,
    announcements: mockAnnouncements,
    loading: false,
    error: null
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
};

// Hook for using the context
export const useMockData = () => useContext(MockDataContext);
