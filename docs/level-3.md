# Level 3 (Advanced): Write-up

Status: in progress (deployment and two Socket.io additions still to do)

## Task 1: Full-stack application (PERN) (in progress)

### Built so far

Backend (Express, TypeScript, PostgreSQL, Prisma):

- Login with bcrypt-hashed passwords (bcryptjs, cost 12) and a JWT stored in an
  HTTP-only cookie (8 hours).
- The first admin is created through a one-time setup route protected by a
  secret setup key. After that, only admins can create staff accounts.
- Role-based access on the server: admins manage products, staff accounts and
  alerts; staff can view products and record sales.
- Deactivated users are locked out immediately, because every request checks
  the user in the database.
- Sales run in a database transaction. Stock is checked and reduced in one
  step, the sale and its items are saved together, and prices are taken from
  the database at the time of sale. A failed sale changes nothing.
- Staff see only their own sales. Admins see all sales.

Frontend (React, TypeScript, Tailwind CSS):

- Login page, protected routes, and role-aware navigation.
- Products page: admins can add, edit and archive; staff can only view.
- Sales page: cart, running total, clear errors for not enough stock or a
  server that cannot be reached, and a sales history.
- Staff page (admin only): create staff accounts, activate and deactivate.

Security:

- Hashed passwords, HTTP-only cookies, CORS limited to the frontend address,
  Helmet security headers, rate limiting on login (10 failed attempts per
  15 minutes), Zod validation on every input, and role checks on the server.

Performance so far:

- Database indexes on the fields we search and filter by.
- Real-time updates send only small messages (product id and new stock)
  instead of reloading whole lists.

### Still to do

- Deploy the frontend and the backend (production cookie settings:
  Secure and SameSite=None).
- Record performance notes from the deployed app.

## Task 2: Real-time communication with Socket.io (in progress)

### Built so far

- Socket.io server on the same HTTP server as Express. A connection needs a
  valid login cookie or it is refused.
- Each user joins a private room, and admins also join an admins room.
- Low-stock alerts are saved in a Notification table inside the sale
  transaction and sent live to admins after the sale is saved. An alert is
  created only when stock drops through the product's threshold or reaches
  zero, so admins are not spammed.
- Every logged-in user receives small stock updates, so product lists and the
  sales dropdown change live.
- React: bell with unread count, saved alert list, pop-up for new alerts,
  mark as read, and automatic catch-up after a dropped connection.

### Still to do

- Two-way events: marking alerts as read through the socket, with other admin
  tabs updating live.
- A user-specific message: telling a user their account was deactivated.
