# Courier - Shipping & Logistics Backend

A production-ready backend API for a shipping/logistics/consignment platform built with Next.js 16, MongoDB, and TypeScript.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB + Mongoose
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Geocoding**: Mapbox API
- **File Uploads**: Cloudinary
- **Email**: Resend
- **Validation**: Zod
- **Language**: TypeScript

## Features

- **Shipment Management**: Full CRUD operations for shipments
- **Real-time Tracking**: Public tracking by tracking code
- **Quote System**: Public quote requests with admin responses
- **File Uploads**: POD, invoices, labels via Cloudinary
- **Email Notifications**: Automated emails on status updates
- **Address Geocoding**: Mapbox integration for address resolution
- **Rate Limiting**: Protection for public endpoints
- **Admin Authentication**: Secure credential-based auth

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your secrets:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/courier

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# Mapbox
MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Resend
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 3. Seed Admin User

Create your first admin user by running the seed script:

```bash
# Using default credentials (admin@courier.com / admin123456)
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-admin.ts

# Or with custom credentials
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-admin.ts \
  --email admin@example.com \
  --password your-secure-password \
  --name "Admin Name"
```

### 4. Run Development Server

```bash
npm run dev
```

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracking?code=XXX` | Track shipment by code |
| POST | `/api/quotes` | Request a shipping quote |
| GET | `/api/mapbox/autocomplete?q=XXX` | Address autocomplete |
| GET | `/api/mapbox/geocode?q=XXX` | Address to coordinates |

### Admin Endpoints (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/shipments` | Create shipment |
| GET | `/api/admin/shipments` | List shipments |
| GET | `/api/admin/shipments/:id` | Get shipment |
| PUT | `/api/admin/shipments/:id` | Update shipment |
| DELETE | `/api/admin/shipments/:id` | Delete shipment |
| PATCH | `/api/admin/shipments/:id/status` | Update status |
| GET | `/api/admin/quotes` | List quotes |
| PATCH | `/api/admin/quotes/:id/respond` | Respond to quote |
| POST | `/api/admin/emails/send` | Send custom email |
| POST | `/api/admin/uploads` | Upload files |

### Authentication

```bash
# Login
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=admin@courier.com&password=admin123456

# Get session
GET /api/auth/session
```

## Admin Frontend

The admin panel is a fully responsive, production-ready UI built with:

- **TanStack Query** - Data fetching & caching
- **React Hook Form + Zod** - Form validation
- **Mapbox GL JS** - Interactive maps
- **Recharts** - Dashboard charts
- **Lucide Icons** - UI icons
- **Sonner** - Toast notifications

### Admin Routes

| Route | Description |
|-------|-------------|
| `/admin/login` | Admin authentication |
| `/admin` | Dashboard with stats & charts |
| `/admin/shipments` | Shipments list with filters |
| `/admin/shipments/new` | Multi-step shipment creation |
| `/admin/shipments/[id]` | Shipment detail with map & timeline |
| `/admin/quotes` | Quote requests & responses |
| `/admin/emails` | Email compose & logs |
| `/admin/settings` | Account settings |

### Features

- **Route Protection** - Automatic redirect to login if not authenticated
- **Responsive Design** - Desktop sidebar + mobile bottom nav
- **Loading States** - Skeleton loaders everywhere
- **Empty States** - Helpful CTAs when no data
- **Confirm Dialogs** - Safe destructive actions
- **Optimistic Updates** - Instant UI feedback
- **Address Autocomplete** - Mapbox integration for address input
- **File Uploads** - Cloudinary signed uploads for attachments

## Project Structure

```
/app
  /admin            # Admin frontend pages
    /login          # Authentication
    /(dashboard)    # Protected pages with sidebar
/app/api
  /admin            # Protected admin API routes
  /auth             # NextAuth handlers
  /tracking         # Public tracking
  /quotes           # Public quote requests
  /mapbox           # Geocoding proxy
/components
  /ui               # Reusable UI components
  /admin            # Admin layout components
  /mapbox           # Map components
/lib
  api.ts            # Typed API client
  query.ts          # React Query config
  validations.ts    # Zod schemas
  utils.ts          # Helper functions
  db.ts             # MongoDB connection
  auth.ts           # NextAuth config
  resend.ts         # Email utilities
  cloudinary.ts     # File upload utilities
/models             # Mongoose schemas
/middleware         # Auth & rate limiting
/utils              # Backend helpers
/types              # TypeScript definitions
```

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run typecheck # Run TypeScript check
```

## Shipment Statuses

### Normal Flow
- `CREATED` - Shipment created, awaiting pickup
- `PICKUP_SCHEDULED` - Pickup has been scheduled with carrier
- `PICKED_UP` - Package collected from sender
- `RECEIVED_AT_ORIGIN_HUB` - Package received at origin facility
- `STORED` - Package stored at facility (consignment only)
- `READY_FOR_DISPATCH` - Package ready to be dispatched
- `IN_TRANSIT` - Package in transit to destination
- `ARRIVED_AT_DESTINATION_HUB` - Package at destination facility
- `OUT_FOR_DELIVERY` - Package out for final delivery
- `DELIVERED` - Package delivered successfully

### Exception Statuses
- `ON_HOLD` - Shipment on hold due to an issue
- `DELIVERY_FAILED` - Delivery attempt unsuccessful
- `RETURNED_TO_SENDER` - Package being returned
- `CANCELLED` - Shipment cancelled
- `DAMAGED` - Package damaged during transit

## Service Types

### Delivery Services
- `STANDARD` - 5-10 business days
- `EXPRESS` - 1-3 business days
- `ECONOMY` - 7-14 business days
- `SAME_DAY` - Same day delivery
- `NEXT_DAY` - Next business day
- `OVERNIGHT` - Overnight delivery

### Freight Services
- `AIR_FREIGHT` - Air cargo shipping
- `SEA_FREIGHT` - Ocean cargo shipping
- `ROAD_FREIGHT` - Ground transportation
- `RAIL_FREIGHT` - Rail cargo shipping

### Specialized Services
- `INTERNATIONAL` - Cross-border shipping
- `CONSIGNMENT` - Consignment storage
- `WAREHOUSING` - Warehouse storage
- `FULFILLMENT` - Order fulfillment
- `CUSTOMS_CLEARANCE` - Customs processing

## Shipment Types

- `SHIPMENT` - Standard shipment
- `CONSIGNMENT` - Consignment/storage

## Payment Methods

- `CASH` - Cash payment
- `BANK_TRANSFER` - Bank transfer
- `CREDIT_CARD` / `DEBIT_CARD` - Card payments
- `PAYPAL` / `STRIPE` - Online payments
- `CRYPTO` - Cryptocurrency
- `INVOICE` - Invoice billing
- `COD` - Cash on Delivery
- `PREPAID` - Prepaid

## Deployment

Deploy to any platform supporting Next.js:

- **Vercel** (recommended)
- **Railway**
- **Render**
- **AWS/GCP/Azure**

Ensure all environment variables are configured in your deployment platform.

## License

Private - All rights reserved
