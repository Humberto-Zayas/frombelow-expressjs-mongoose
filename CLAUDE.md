# CLAUDE.md - From Below Studio Backend

## Development Commands

```bash
npm run dev      # Development server with nodemon (hot reload)
npm run build    # TypeScript compilation to dist/
npm start        # Production server (runs compiled JS)
```

## Architecture Overview

**Entry Point:** `src/index.ts` - Express server setup, middleware, route mounting

**Database:** `src/lib/db.ts` - Mongoose connection to MongoDB

### Models (`src/models/`)
- `Booking.ts` - Studio booking records with status tracking
- `Day.ts` - Day-based availability and pricing
- `Availability.ts` - Time slot availability configuration
- `Country.ts` - Country list for form dropdowns

### Routes (`src/routes/`)
- `bookings.ts` - CRUD operations for bookings, status updates
- `days.ts` - Day availability management
- `email.ts` - Email sending endpoints
- `country.ts` - Country list API

### Services
- `src/emailService.ts` - Nodemailer/Gmail integration for notifications

## Environment Variables

**Required:**
- `MONGO_URL` - MongoDB connection string
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASS` - Gmail app password
- `ADMIN_EMAIL` - Admin notification recipient

**Optional:**
- `PORT` - Server port (default: 3333)
- `NODE_ENV` - Environment mode
- `FRONTEND_URL` - Frontend URL for CORS

## Key Patterns

- Route files contain controller logic inline (no separate controllers)
- CORS whitelist configured for specific origins (localhost, production URLs)
- Email notifications triggered on booking status changes
- Deployed on Railway with automatic builds
