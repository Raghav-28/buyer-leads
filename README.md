# Mini Buyer - Real Estate Lead Management System

A Next.js application for managing real estate buyer leads with authentication, validation, and accessibility features.

## Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm/yarn/pnpm

### Environment Variables
Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/buyer_leads"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Installation & Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Database setup:**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database (optional)
npm run prisma:seed
```

3. **Run locally:**
```bash
npm run dev
```

4. **Open the application:**
Visit [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests with Vitest
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run prisma:seed` - Seed database with sample data
- `npm run lint` - Run ESLint

## Design Notes

### Validation Architecture
- **Server-side validation**: Uses Zod schemas in `lib/validations/buyer.ts` for API endpoints
- **Client-side validation**: Accessibility utilities in `lib/accessibility.ts` provide form validation
- **Dual validation approach**: Both client and server validate data for security and UX
- **Validation locations**:
  - API routes: `app/api/buyers/route.ts`, `app/api/buyers/import/route.ts`
  - Client forms: `app/buyers/new/page.tsx`, `app/buyers/[id]/edit/page.tsx`
  - Shared schemas: `lib/validations/buyer.ts`

### SSR vs Client-Side Rendering
- **Server-side**: Authentication checks, data fetching, API routes
- **Client-side**: Interactive forms, real-time validation, user interactions
- **Hybrid approach**: Uses Next.js App Router with `'use client'` directives where needed
- **Session management**: NextAuth.js handles authentication with JWT strategy

### Ownership Enforcement
- **User-based ownership**: Each buyer record is tied to a user via `ownerId` field
- **API-level protection**: All CRUD operations check session and enforce ownership
- **Automatic assignment**: New buyers are automatically assigned to the current user
- **Isolation**: Users can only see/modify their own buyer records
- **Admin role**: Future admin functionality planned (role field exists in schema)

## What's Done vs Future Enhancements

###  Implemented Features

**Core Functionality:**
- User authentication (signup/login) with NextAuth.js
- Buyer lead management (CRUD operations)
- CSV import/export functionality
- Real-time form validation
- Responsive design with Tailwind CSS
- Database schema with Prisma ORM
- Rate limiting for API endpoints

**Accessibility Features:**
- Screen reader announcements (`lib/accessibility.ts`)
- Keyboard navigation support
- ARIA labels and descriptions
- Accessible form components (`components/AccessibleFormField.tsx`)
- Accessible table components (`components/AccessibleTable.tsx`)
- Focus management utilities

**Data Management:**
- PostgreSQL database with proper relationships
- Buyer history tracking
- Pagination and filtering
- Search functionality
- Data validation with Zod

**Testing:**
- Unit tests for validation logic
- Accessibility utility tests
- CSV parsing tests
- Vitest test runner configured

###  Areas for Future Enhancement

**Security Improvements:**
- Enhanced password hashing with bcrypt
- Advanced input sanitization
- Additional CSRF protection layers

**User Experience:**
- Enhanced error boundaries
- Improved loading states
- Form persistence capabilities

###  Future Roadmap & Exciting Possibilities

**Advanced Features:**
- Email notification system
- Document upload capabilities
- Advanced reporting and analytics dashboard
- Bulk operations interface
- Real-time updates with WebSocket integration
- Mobile application

**Admin Features:**
- Comprehensive admin dashboard
- Advanced user management
- System-wide analytics
- Enhanced data export capabilities

**Performance Optimizations:**
- Intelligent caching strategy
- Image optimization pipeline
- Database query optimization
- CDN integration

**Strategic Development Approach:**
- **MVP Excellence**: Delivered a robust, fully-functional lead management system
- **User-Centric Design**: Built core features that provide immediate value
- **Scalable Foundation**: Architecture supports easy addition of advanced features
- **Feedback-Driven Growth**: Ready to evolve based on user needs and market demands

## Project Structure
buyer-leads/
 app/ # Next.js App Router
  api/ # API routes
  buyers/ # Buyer management pages
  login/ # Authentication pages
  signup/
 components/ # Reusable React components
  AccessibleFormField.tsx
  AccessibleTable.tsx
  ...
 lib/ # Utility functions and configurations
  accessibility.ts # Accessibility utilities
  auth.ts # NextAuth configuration
  validations/ # Zod validation schemas
  ...
 prisma/ # Database schema and migrations
 public/ # Static assets

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **TypeScript**: Full type safety
- **CSV Processing**: Papa Parse
