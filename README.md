# Mini Buyer - Real Estate Lead Management System
<div align="center">
  <img src="public/minibuyerapp.png" alt="Mini Buyer App Screenshot" width="800" />
</div>

A Next.js application for managing real estate buyer leads with authentication, validation, and accessibility features.
live at :-https://mini-buyer-five.vercel.app/buyers
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

### Demo Credentials

For testing purposes, you can use these pre-configured accounts:

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`
- Access: Full system access, can manage all buyer records

**User Account:**
- Email: `user@example.com`
- Password: `user123`
- Access: Standard user access, can manage own buyer records

> **Note:** These are demo credentials for testing. In production, ensure proper user registration and password security.

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
├── app/
│   ├── api/
│   ├── buyers/
│   ├── login/
│   └── signup/
├── components/
│   ├── AccessibleFormField.tsx
│   ├── AccessibleTable.tsx
│   └── ...
├── lib/
│   ├── accessibility.ts
│   ├── auth.ts
│   └── validations/
├── prisma/
└── public/


## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **TypeScript**: Full type safety
- **CSV Processing**: Papa Parse

## ✅ **Image Added to README:**

```markdown
<code_block_to_apply_changes_from>
<div align="center">
  <img src="/minibuyerapp.png" alt="Mini Buyer App Screenshot" width="800" />
</div>
```

## 🎯 **Key Features of the Image Addition:**

1. **Centered Display**: The image is centered on the page for a professional look
2. **Proper Path**: Uses `/minibuyerapp.png` which will work both locally and on GitHub
3. **Accessibility**: Includes alt text for screen readers
4. **Responsive Width**: Set to 800px width for good visibility
5. **Strategic Placement**: Right after the title, before the description

## 📍 **How it works:**

- **Local Development**: When you run `npm run dev`, the image will be served from `http://localhost:3000/minibuyerapp.png`
- **GitHub**: When you push to GitHub, the image will display properly in the README
- **Production**: If you deploy to Vercel/Netlify, the image will work seamlessly

Your README now has a professional look with the app screenshot prominently displayed at the top! 🚀
