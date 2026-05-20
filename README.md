# LAB1-Projekti

## Local setup

This project is configured for a local PostgreSQL database with:

- host: `localhost`
- port: `5432`
- user: `postgres`
- password: `postgres`
- database: `lab1`

The backend reads these values from [backend/.env](/c:/Users/jakub/OneDrive/Documents/GitHub/LAB1-Projekti/backend/.env).

## Run

1. Make sure PostgreSQL is running locally and that the `postgres` user exists with password `postgres`.
2. Install dependencies:

```bash
npm run install:all
```

3. Run database migrations:

```bash
npm run migrate
```

4. Start the app:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and backend runs on `http://localhost:5000`.
