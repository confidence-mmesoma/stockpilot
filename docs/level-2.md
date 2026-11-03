# Level 2 (Intermediate): Write-up

## Task 3: Database integration (completed)

### What I built
- PostgreSQL 17 database (stockpilot) managed with Prisma 7.
- Models: User (with ADMIN/STAFF role), Product, Sale, SaleItem.
- Relationships: a User makes many Sales; a Sale has many SaleItems;
  each SaleItem points to one Product.
- Prices stored as exact decimals (Decimal 12,2), not floating point.
- Indexes on Product name and archive status, and on Sale user and date,
  and on SaleItem sale and product. Unique rules on email and SKU.
- Product API now reads and writes PostgreSQL instead of in-memory data.
- Validation runs with Zod before anything is saved. Duplicate SKUs are also
  rejected by the database itself (unique constraint, error P2002 mapped to 409).
- Migration `init` saved in server/prisma/migrations.

### What changed from Level 1
- The in-memory array was replaced by Prisma queries; route URLs and
  responses stayed the same.
- Backend converted from JavaScript to TypeScript, because Prisma's
  generated client is TypeScript.
- Handlers became async; prices are converted from Decimal to numbers
  in API responses.

### Testing
15 endpoint cases tested in Hoppscotch, plus a restart test showing the data
survives a server restart. Relationships and indexes confirmed in psql.

### Not used by the app yet
The User, Sale and SaleItem tables exist and are linked, but the app code
that uses them (authentication and sales) comes in Level 3.

## Task 1: React frontend (completed)

### What I built
- React + TypeScript + Tailwind CSS app (Vite) in the client/ folder.
- Product list loaded from the Express API, with loading, error and retry states.
- Create, edit and archive products from the UI.
- Reusable components: Button, FormField, ProductForm, ProductTable,
  Spinner, ErrorMessage.
- Data layer: one request() helper (api/http.ts) that turns failures into
  readable errors, product API functions (api/products.ts), and a
  useProducts hook that loads the data.
- Functional components with React state (useState, useEffect, a custom hook).
- Forms validate in the browser first, then show any field errors returned
  by the server.
- CORS enabled on the API for the client address only (CLIENT_URL).

### Testing
Tested in the browser: list, loading state (throttled network), error and
retry (server stopped), create (valid, empty, duplicate SKU, server-side
validation error, server down), edit (prefilled form, update, empty name,
duplicate SKU, cancel), archive (cancel, confirm, server down).

### Note
The client uses TypeScript 6 because typescript-eslint does not support
TypeScript 7 yet. The server uses TypeScript 7.