# BMS Digital Signage - Project Overview

This document provides a comprehensive overview of the BMS Digital Signage project, its architecture, components, and how they work together.

## Project Purpose

The BMS Digital Signage system is designed to display dynamic content for Botswana Marketing Services (BMS), including:

- Product showcases with pricing
- Promotional announcements
- Category highlights
- Special offers

The system consists of two main interfaces:
1. A public-facing display for customers
2. An admin interface for content management

## Technical Architecture

### Technology Stack

- **Frontend**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Serverless Functions**: Supabase Edge Functions

### Project Structure

```
BMS_Digital_Signage/
├── client/                  # Frontend application
│   ├── public/              # Static assets
│   │   └── images/          # Source images
│   ├── src/                 # Source code
│   │   ├── admin/           # Admin interface components
│   │   ├── components/      # Shared components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Page components
│   │   └── utils/           # Utility functions
│   ├── .env                 # Environment variables
│   └── package.json         # Client dependencies
├── supabase/                # Supabase configuration
│   ├── functions/           # Edge functions
│   └── schema/              # Database schema
└── documentation/           # Project documentation
```

## Core Components

### Display Interface

The display interface (`client/src/pages/Display.tsx`) is the public-facing digital signage that shows:

- Slideshow of products, categories, and announcements
- Information bar with date, time, and custom messages
- Animated background effects

### Admin Interface

The admin interface (`client/src/admin/`) provides content management capabilities:

- Dashboard with system overview
- Product management (add, edit, delete)
- Category management
- Announcement management
- Image upload and management
- Import/Export functionality (CSV)
- System settings

### Database Schema

The Supabase database includes the following tables:

- `products`: Store product information
- `categories`: Store product categories
- `announcements`: Store promotional announcements
- `settings`: Store application configuration

### Image Management

Images are stored in Supabase Storage buckets:

- `branding`: Brand assets
- `products`: Product images
- `uniforms`: Uniform items
- `announcements`: Promotional banners
- `ui-elements`: Interface elements

## Key Features

### Dynamic Content Management

- Real-time updates to displayed content
- Scheduled announcements and promotions
- Category-based product organization

### Image Handling

- Automated image upload and categorization
- Standardized naming conventions
- Optimized storage structure

### User Authentication

- Secure admin access
- Role-based permissions
- Protected routes

### Data Import/Export

- CSV import for bulk data updates
- CSV export for backup and reporting
- Data validation and error handling

## Getting Started

To get started with the project:

1. **Setup**: Follow the [Server Setup Documentation](server-setup-documentation.md)
2. **Image Management**: Refer to the [Image Upload Documentation](image-upload-documentation.md)
3. **Development**: Explore the codebase starting with `client/src/App.tsx`

## Development Workflow

1. **Local Development**:
   - Run the development server
   - Make changes to the codebase
   - Test changes in the browser

2. **Database Changes**:
   - Update schema in Supabase
   - Apply migrations as needed
   - Update corresponding frontend code

3. **Deployment**:
   - Build the client application
   - Deploy to hosting provider
   - Configure environment variables

## Integration Points

### Supabase Integration

The application connects to Supabase through:

- `client/src/utils/supabaseClient.ts`: Client initialization
- React hooks for data fetching and state management
- Edge functions for complex operations

### External Systems

The system can integrate with:

- Point of Sale (POS) systems via CSV import/export
- Inventory management systems
- Marketing automation tools

## Performance Considerations

- Image optimization for faster loading
- Caching strategies for frequently accessed data
- Lazy loading of components and assets
- Efficient database queries

## Security Measures

- Row Level Security (RLS) policies in Supabase
- Secure authentication flow
- Environment variable protection
- Input validation and sanitization

## Future Enhancements

Potential areas for future development:

- Advanced scheduling capabilities
- Analytics dashboard
- Multi-location support
- Mobile companion app
- AI-powered content recommendations

## Additional Resources

- [Server Setup Documentation](server-setup-documentation.md)
- [Image Upload Documentation](image-upload-documentation.md)
- [Supabase Documentation](https://supabase.io/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
