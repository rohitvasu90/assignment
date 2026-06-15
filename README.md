# Organization Portal

A full-stack web application that enables multiple organizations to manage users and projects within isolated workspaces. Built with Node.js, Express, MySQL, and React.

## Features

- **Organization-based isolation** — Shared database with strict organization-level data separation
- **Role-based access control** — Super Admin, Organization Admin, and User roles
- **JWT authentication** — Secure token-based auth with bcrypt password hashing
- **Project management** — CRUD with pagination, search, filtering, and sorting
- **Clean architecture** — Controllers, services, models, and middleware separation

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React, React Router, Axios, Context API |
| Backend  | Node.js, Express.js                 |
| Database | MySQL                               |
| Auth     | JWT, bcrypt                         |

## Project Structure

```
Assignment/
├── backend/          # Express API
│   ├── src/
│   │   ├── config/       # Database & env config
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data access layer
│   │   ├── routes/       # API routes
│   │   ├── middlewares/  # Auth, role, tenant guards
│   │   ├── validators/   # Input validation
│   │   ├── migrations/   # Database migrations
│   │   └── seeders/      # Seed data
│   └── server.js
├── frontend/         # React SPA
│   └── src/
│       ├── api/          # Axios API client
│       ├── context/      # Auth context
│       ├── pages/        # Route pages
│       ├── components/   # Reusable UI
│       └── routes/       # Protected routes
└── README.md
```

## Prerequisites

- Node.js 18+
- MySQL 8.0+

## Setup

### 1. Database

Create a MySQL database (or let migrations create it automatically):

```sql
CREATE DATABASE organization_portal;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=organization_portal
JWT_SECRET=your-secret-key
```

Run migrations and seed data:

```bash
npm run migrate
npm run seed
```

Start the API server:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Default Credentials

| Role         | Email                    | Password    |
| ------------ | ------------------------ | ----------- |
| Super Admin  | superadmin@example.com   | password123 |
| Org Admin    | admin@demo.com           | password123 |
| User         | user@demo.com            | password123 |

## API Endpoints

### Authentication

| Method | Endpoint          | Description |
| ------ | ----------------- | ----------- |
| POST   | /api/auth/login   | Login       |
| GET    | /api/auth/me      | Get profile |

### Organizations (Super Admin)

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| GET    | /api/organizations        | List all           |
| POST   | /api/organizations        | Create             |
| PUT    | /api/organizations/:id    | Update             |
| DELETE | /api/organizations/:id    | Delete             |

### Users (Super Admin / Org Admin)

| Method | Endpoint          | Description |
| ------ | ----------------- | ----------- |
| GET    | /api/users        | List users  |
| POST   | /api/users        | Create user |
| PUT    | /api/users/:id    | Update user |
| DELETE | /api/users/:id    | Delete user |

### Projects (Org Admin / User)

| Method | Endpoint                  | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| GET    | /api/projects             | List (pagination, search, filter)    |
| GET    | /api/projects/:id         | Get details                          |
| POST   | /api/projects             | Create project                       |
| PUT    | /api/projects/:id         | Update project                       |
| DELETE | /api/projects/:id         | Delete project                       |
| GET    | /api/projects/dashboard/stats | Dashboard statistics           |

## Organization Isolation

Data isolation is enforced at three layers:

1. **Middleware** — `tenantGuard` and `requireOrganization` validate tenant context
2. **Service layer** — Every query scopes by `organization_id` from the authenticated user
3. **Database queries** — All reads/writes include `WHERE organization_id = ?`

Super admins bypass tenant restrictions for cross-organization visibility.

## Roles & Permissions

| Permission              | Super Admin | Org Admin | User |
| ----------------------- | ----------- | --------- | ---- |
| Manage organizations    | Yes         | No        | No   |
| Manage users (own org)  | Yes (all)   | Yes       | No   |
| Manage projects (own org)| View all   | Yes       | Yes  |
| Create projects         | No          | Yes       | Yes  |

## Security

- JWT token authentication on all protected routes
- bcrypt password hashing (12 rounds)
- Role-based authorization middleware
- Input validation via express-validator
- Parameterized SQL queries (SQL injection protection)
- Centralized error handling
- Environment variables for secrets

## License

MIT
