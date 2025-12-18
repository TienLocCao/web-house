# Laroa Studio - Interior Design & Furniture E-Commerce

A modern, full-stack interior design and furniture e-commerce website built with Next.js 16, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

### Frontend
- **Responsive Design**: Mobile-first design with smooth animations
- **Component-Based Architecture**: Reusable React components
- **SEO Optimized**: Server-side rendering, semantic HTML, meta tags
- **Smooth Animations**: Intersection Observer API for scroll animations
- **Modern UI**: Tailwind CSS v4 with custom design tokens

### Backend
- **PostgreSQL Database**: Robust relational database with Neon
- **RESTful API**: Type-safe API routes with validation
- **Security**: Rate limiting, input sanitization, SQL injection prevention, XSS protection
- **Performance**: Connection pooling, caching, indexes
- **Data Validation**: Zod schemas for type-safe validation

## Database Schema

- **Products**: Furniture items with pricing, stock, ratings
- **Categories**: Product categorization
- **Projects**: Portfolio of completed interior design projects
- **Reviews**: Customer product reviews with moderation
- **Orders**: Order management with items and tracking
- **Newsletter**: Email subscription management
- **Contact**: Customer inquiry tracking

## API Endpoints

### Products
- `GET /api/products` - List products with filtering and pagination
- `GET /api/products/:slug` - Get single product with related items

### Projects
- `GET /api/projects` - List projects with filtering

### Categories
- `GET /api/categories` - List all categories

### Contact & Newsletter
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter` - Subscribe to newsletter

### Reviews
- `POST /api/reviews` - Submit product review (requires approval)

### Orders
- `POST /api/orders` - Create new order with stock management

### Statistics
- `GET /api/stats` - Get website statistics

## Security Features

1. **Rate Limiting**: Prevents abuse with configurable limits per endpoint
2. **Input Sanitization**: Removes malicious characters from user input
3. **SQL Injection Prevention**: Parameterized queries throughout
4. **XSS Protection**: Content Security Policy headers
5. **Validation**: Zod schemas validate all inputs
6. **CORS**: Configured for security
7. **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.

## Setup Instructions

### 1. Database Setup

Run the migration scripts in order:

```bash
# Create tables
node scripts/01-create-tables.sql

# Seed initial data
node scripts/02-seed-data.sql
```

### 2. Environment Variables

Required environment variables (already configured via Neon integration):
- `DATABASE_URL` - PostgreSQL connection string

### 3. Install Dependencies

Dependencies are automatically inferred from imports.

### 4. Run Development Server

```bash
npm run dev
```

## Performance Optimizations

1. **Database Indexes**: Strategic indexes on frequently queried columns
2. **Connection Pooling**: Singleton SQL client pattern
3. **Caching**: HTTP caching headers on API responses
4. **Image Optimization**: Next.js Image component
5. **Code Splitting**: Automatic route-based splitting
6. **Rate Limiting**: Prevents server overload

## Code Quality

- **TypeScript**: Full type safety
- **Modular Architecture**: Separation of concerns
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Production-ready logger utility
- **Validation**: Input validation at API boundaries
- **Comments**: Clear documentation in code

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes (Edge Runtime)
- **Database**: PostgreSQL (Neon)
- **Validation**: Zod
- **State Management**: SWR
- **UI Components**: Radix UI, shadcn/ui

## License

© 2025 Laroa Studio. All rights reserved.
