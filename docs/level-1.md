# Level 1 (Basic): Write-up

## Task 1: Development environment setup (completed)

### Tools
- Node.js v24.18.0 and npm 11.16.0
- Git 2.55.0
- VS Code
- PostgreSQL 17.10 (database: stockpilot)

### What I did
- Checked which tools were already installed before installing anything.
- Found three PostgreSQL versions installed (16, 17, 18) and chose 17.
- Created the stockpilot database and confirmed the connection.
- Created the GitHub repository, cloned it, and added a .gitignore.
- Practiced the Git workflow: status, diff, add, commit, push, log.

### Problem solved
psql was not recognized in the terminal because the PostgreSQL bin folder was
not on PATH. I added it to my user PATH, but the change did not reach my
terminal sessions, so I called psql by its full path instead. This is fine
because Node and Prisma connect to the database directly and do not need
psql on PATH.

### Terminal commands used
cd, dir, del, code ., git status/add/commit/push/diff/log

## Task 2: Express REST API (completed)

### What I built
- Express 5 server in the `server/` folder with a health check route.
- Product CRUD API at /api/products using temporary in-memory data
  (it is replaced by PostgreSQL and Prisma in Level 2).
- Zod validation for product data (name, SKU, price, stock, threshold).
- Delete archives a product instead of removing it permanently.
- Central error handling: 400 (invalid input or JSON), 404 (not found),
  409 (duplicate SKU), 500 (unexpected server error).

### Endpoints
- GET /api/health
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id (archives)

### Testing
Tested all 12 cases with Hoppscotch, an API client that does the same job
as Postman or Thunder Client: list, get one, not found, invalid id, create,
duplicate SKU, validation errors, update, empty update, archive, archived
product hidden, unknown route.