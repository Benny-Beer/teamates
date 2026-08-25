# Teamates

A sports matchmaking platform where users can create and join local sports sessions with nearby players.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot, Maven |
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui |
| Database | PostgreSQL (with PostGIS for geo queries) |
| Auth | Google OAuth 2.0 + JWT (HttpOnly cookies) |
| External APIs | Google Places API, Google Maps API |

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL with PostGIS extension enabled
- Google Cloud project with OAuth 2.0 credentials and Places API key enabled

### Backend Setup

1. Create the `teamates` PostgreSQL database and apply the schema manually (Hibernate runs in `validate` mode — it will not create tables).

2. Configure the application:
   ```bash
   cp src/main/resources/application.properties.example \
      src/main/resources/application.properties
   ```
   Fill in your database credentials, Google OAuth client ID, Google Places API key, and a JWT secret (≥ 32 characters).

3. Start the backend:
   ```bash
   ./mvnw spring-boot:run
   ```
   The server runs on `http://localhost:8080`.

### Frontend Setup

1. Configure the environment:
   ```bash
   cp teamates-frontend/.env.example teamates-frontend/.env
   ```
   Set `VITE_GOOGLE_MAPS_API_KEY` in `.env`.

2. Install dependencies and start the dev server:
   ```bash
   cd teamates-frontend
   npm install
   npm run dev
   ```
   The app runs on `http://localhost:5173`. API calls to `/api/*` are proxied to the backend automatically.

## Features

- **Google Sign-In** — authenticate with your Google account
- **Create sessions** — set sport type, location (via Google Places), date/time, player limits, and optional age/gender filters
- **Browse & search sessions** — filter by sport, age range, gender, and proximity
- **Join / leave sessions** — registration tracked per user
- **Facility management** — venues are looked up via Google Places and stored locally
- **Profile management** — complete your profile after first login

## Project Structure

```
teamates/
├── src/main/java/com/teamates/
│   ├── controller/                # REST endpoints
│   ├── service/                   # Business logic
│   ├── repository/                # JPA data access
│   ├── model/                     # JPA entities & enums
│   ├── dto/                       # Response DTOs & mappers
│   ├── auth/                      # OAuth provider abstraction
│   ├── security/                  # JWT filter & config
│   └── exception/                 # Global error handling
└── teamates-frontend/             # React + Vite frontend
    └── src/
        ├── pages/                 # Route-level components
        ├── components/            # Shared UI & shadcn/ui primitives
        ├── context/               # AuthContext (global auth state)
        └── hooks/                 # Custom hooks (Google Places autocomplete)
```

## Available Scripts

### Backend
```bash
./mvnw spring-boot:run    # Run the application
./mvnw test               # Run tests
./mvnw clean install      # Full build
```

### Frontend (`teamates-frontend/`)
```bash
npm run dev       # Start dev server with HMR
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```
