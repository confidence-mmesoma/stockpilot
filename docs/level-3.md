# Level 3 (Advanced): Write-up

Status: in progress

## Task 1: Full-stack application (in progress)

### Done so far (backend)
- Login with bcrypt-hashed passwords (bcryptjs, cost 12) and JWT stored in an
  HTTP-only cookie (8 hours, SameSite=Lax in development).
- First admin created through a one-time setup route protected by a secret
  setup key. After that, only admins can create staff accounts.
- Role-based access: admins manage products and users; staff can view products
  and record sales.
- Deactivated users are locked out immediately, because every request checks
  the user in the database.
- Sales API: a database transaction reduces stock, saves the sale and its
  items together, or saves nothing. Stock is checked and reduced in one step so
  two sales cannot take the same last item. Prices are taken from the database
  at the time of sale.
- Staff see only their own sales; admins see all sales.

### Still to do
- Login screen, sales screen and staff screen in React.
- Deployment of the frontend and backend.

## Task 2: Real-time communication with Socket.io (not started)