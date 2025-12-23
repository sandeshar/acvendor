# Next.js Web Application Documentation

## Project Overview: Content Solutions Nepal Web App
This document provides technical and operational documentation for the Next.js web application developed for Content Solutions Nepal. The application, codenamed "Chitrabazaar," is a modern, fast, and scalable platform designed to meet the growing content needs of the organization.

The application leverages Next.js (App Router) for server-side rendering (SSR), static site generation (SSG), and route handlers for backend APIs, ensuring optimal performance, SEO, and developer experience.

---

## I. Technical Stack

### Core Technologies
- **Frontend Framework:** Next.js `16.0.5`
- **Core Library:** React `19.2.0`
- **Styling:** Tailwind CSS `^4`
- **Icons:** `react-icons ^5.5.0`
- **Rich Text Editor:** TipTap `^3.11.1` with lowlight
- **ORM:** Drizzle ORM `^0.44.7`
- **Database Driver:** `mysql2 ^3.15.3`

### Backend/API
- **App Router API:** Route handlers under `src/app/api/*` (e.g., `src/app/api/blog/route.ts`)
- **Authentication:** Not yet implemented (planned: JWT)
- **Database:** MySQL (via Drizzle ORM). Dialect configured in `drizzle.config.ts`.

---

## II. Development Environment Setup

### Prerequisites
- Node.js (LTS recommended)
- npm or Yarn

### Installation
```bash
git clone <repository URL>
cd contentsolution
npm install
# or
yarn install
```

### Configure Environment Variables
Create a file named `.env.local` in the project root and populate it with required keys. Common variables:
```
DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<database>"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_ANALYTICS_KEY=""
```

Email / SMTP (for contact form notifications):
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
FROM_EMAIL=no-reply@example.com
ADMIN_EMAIL=admin@example.com
```
If `SMTP_*` variables are set, the app will send an admin notification and an acknowledgement email to submitters when a new contact form submission is received. Admin email is read from `store settings` (`contactEmail`) or the `ADMIN_EMAIL` env var as a fallback.

Uploads configuration:

- `UPLOAD_DIR`: Filesystem path (absolute or relative to project root) where uploads are saved. Defaults to `public/uploads`.
- `UPLOAD_BASE_URL`: Public base URL used to build the returned file URL. If not set and `UPLOAD_DIR` is inside `public`, the URL will be served from the public path (e.g., `/uploads/...`). If `UPLOAD_DIR` is outside `public` and `UPLOAD_BASE_URL` is not set, the API will return a `file://` path.

Example:

```
UPLOAD_DIR=public/uploads
UPLOAD_BASE_URL=${NEXT_PUBLIC_BASE_URL}/uploads
```

API endpoint for uploads: `POST /api/upload`

Multipart form fields:

- `file`: The file to upload (required)
- `folder`: Optional subfolder within `UPLOAD_DIR` (alphanumeric, dash, underscore)
```
`DATABASE_URL` is used by Drizzle and `mysql2` (see `drizzle.config.ts`).

### Running the Application
- `npm run dev`: Runs the app in development mode (hot reload). URL: `http://localhost:3000`
- `npm run build`: Creates a production build
- `npm run start`: Starts the production server using built files. URL: `http://localhost:3000`
- `npm run lint`: Runs ESLint

---

## III. Application Structure and Architecture

This project uses the App Router (`src/app`) rather than the legacy `pages` directory.

### Key Directories
- `src/app/`: Route segments, layouts, and pages (server-first by default)
	- `src/app/admin/*`: Admin area (layouts and nested routes)
	- `src/app/api/*`: Route handlers (serverless API endpoints)
	- `src/app/ui/*`: Public-facing UI pages (about, contact, faq, home, services, termsandconditions)
- `src/components/`: Reusable components (e.g., `Sidebar.tsx`)
- `src/db/`: Database configuration and schema (`index.ts`, `schema.ts`)
- `drizzle/`: SQL migrations and snapshots
- `public/`: Static assets
- `tailwind.config.ts`, `postcss.config.mjs`: Styling config
- `eslint.config.mjs`, `tsconfig.json`: Linting and TypeScript config

### Data Layer
- **ORM:** Drizzle ORM configured for MySQL (`dialect: 'mysql'` in `drizzle.config.ts`)
- **Schema:** See `src/db/schema.ts` for `users`, `blog_posts`, and `status` tables

### Data Fetching Strategy (App Router)
- **SSR:** Default for server components and for authenticated/admin pages under `src/app/admin/*`
- **SSG/ISR:** For static informational pages under `src/app/ui/*` where applicable, using static server components and optional revalidation
- **CSR:** Client components and hooks for interactive features; SWR or `useEffect` can be added where needed
- **API Handlers:** `src/app/api/*/route.ts` provides server-side endpoints consumed by pages and clients

---

## IV. Deployment and Operations

### CI/CD
- Platform: TBD (recommended: GitHub Actions)
- Pipelines: Build and deploy on push to `master`

### Hosting
- Recommended: Vercel (native Next.js support)
- Alternative: Node.js server with `npm run start`
- cPanel: Use the included `server.js` to run a Node server. Typical steps on the cPanel Node.js app setup:

  1. `npm install`
  2. `npm run build`
  3. `npm start`  # runs `node server.js` which uses `process.env.PORT`

  Make sure the cPanel Node.js app points to `npm start` as the startup command and exposes the correct `PORT` environment variable.

### Environments
- Staging: TBD
- Production: TBD

### Monitoring and Logging
- Monitoring: TBD (e.g., Vercel Analytics, LogRocket, Sentry)
- Key metrics: Page load time, server response time, error rates

---

## V. Key Contacts
- **Lead Developer:** Person — [Developer Email]
- **Project Manager:** Person — [Manager Email]
- **Content Solutions Nepal Contact:** Person — [Client Contact Email]

---

## VI. Future Roadmap
- Implement internationalization (i18n)
- Integrate a dedicated search engine (e.g., Meilisearch or Algolia)
- Optimize deployment for faster rollouts (CI/CD enhancements)
- Architecture review on scheduled date (calendar invite)

---

## Key Application Pages

Note: This project uses the App Router (`src/app`) rather than `pages/`. Below is the intended functional mapping and rendering strategies aligned with the current structure.

### Public UI
- `/` (`src/app/page.tsx`): Main landing; SSG/ISR
- `/admin` (`src/app/admin/page.tsx`): Admin dashboard; SSR/protected
- `/admin/blog` (`src/app/admin/blog/page.tsx`): Manage blogs; SSR/protected
- `/admin/blog/add` (`src/app/admin/blog/add/page.tsx`): Add blog; SSR/protected
- `/admin/blog/edit/[id]` (`src/app/admin/blog/edit/[id]/page.tsx`): Edit blog; SSR/protected
- `/admin/store-setting` (`src/app/admin/store-setting/page.tsx`): Store settings; SSR/protected
- `/ui/home` (`src/app/admin/ui/home/page.tsx`): Home template; SSR/SSG depending on content
- `/ui/about` (`src/app/admin/ui/about/page.tsx`): About us; SSG
- `/ui/contact` (`src/app/admin/ui/contact/page.tsx`): Contact; SSG
- `/ui/faq` (`src/app/admin/ui/faq/page.tsx`): FAQ; SSG
- `/ui/services` (`src/app/admin/ui/services/page.tsx`): Services; SSG/ISR
- `/ui/termsandconditions` (`src/app/admin/ui/termsandconditions/page.tsx`): Terms & Conditions; SSG
- `/admin/users` (`src/app/admin/users/page.tsx`): Admin user management; SSR/protected

### API Routes (App Router)
- `POST/GET /api/blog` (`src/app/api/blog/route.ts`): Blog management endpoint

---

## Frontend Features
- Home Page
- Services Page Template (multiple category templates)
- Blogs
- Contact Us Page
- FAQ
- About Us
- Our Team
- Terms & Conditions
- Privacy Policy

## Backend Features
- Home Page Template
- Services Page Template → Add/Manage Services
- Blog Template Page
- Contact Us Details
- FAQ Management
- About Us Details
- Our Team Management
- Terms and Conditions Management
- Admin Management

---

## Database
- **Type:** MySQL
- **Access:** `DATABASE_URL` env var
- **Migrations:** Drizzle (`drizzle/` folder contains SQL migrations and snapshots)

---

## Notes
- Authentication is not yet implemented; plan is to use JWT and protect admin routes.
- State management libraries (Redux Toolkit/Zustand) are not currently in use; local and server component state is used. Introduce a global state store as needed.

