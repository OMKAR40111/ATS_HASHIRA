# SARDHYA Foods Dev

Full-stack starter for an online food shopping and catering booking app.

## Stack

- Frontend: Next.js + React
- Backend: Express
- Database: MySQL-ready schema

## Structure

- `frontend` - customer-facing web app
- `backend` - API server and seed data
- `backend/sql` - MySQL schema and seed files

## Run locally

1. Install dependencies in `frontend` and `backend`.
2. Copy `.env.example` to `.env` files as needed.
3. Start the backend on port `4000`.
4. Start the frontend on port `3000`.

## Main features in the starter

- Menu browsing with category filters
- Shopping cart and checkout flow
- Catering booking form
- Authentication screens
- Admin overview dashboard

The backend prefers MySQL, but it can fall back to in-memory demo data if MySQL credentials are missing so the app still starts. Set `MYSQL_USER` and `MYSQL_PASSWORD` in your `.env` file to switch fully onto the database.
