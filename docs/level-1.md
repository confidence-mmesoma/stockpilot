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

## Task 2: Express REST API
(in progress)