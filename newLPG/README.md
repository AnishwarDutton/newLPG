# LPG Manager — Setup & Run Guide

## Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 16+ and npm
- PostgreSQL 13+ running locally

---

## Step 1 — Create the Database

Open psql or pgAdmin and run:

```sql
CREATE DATABASE lpg_db;
```

---

## Step 2 — Configure Password

Open `backend/src/main/resources/application.properties` and replace:

```
spring.datasource.password=YOUR_POSTGRES_PASSWORD_HERE
```

with your actual PostgreSQL password.

---

## Step 3 — (Optional) Load Sample Data

If you want pre-loaded sample data, run the schema.sql file:

```bash
psql -U postgres -d lpg_db -f backend/src/main/resources/schema.sql
```

Hibernate will auto-create tables anyway via `ddl-auto=update`.

---

## Step 4 — Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Wait until you see: `Started LpgManagementApplication on port 8080`

---

## Step 5 — Start the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The app opens at: http://localhost:3000

---

## Troubleshooting

| Problem | Fix |
|---|---|
| 403 errors in browser | Make sure backend is running on port 8080 |
| DB connection failed | Check password in application.properties |
| `lpg_db` not found | Run `CREATE DATABASE lpg_db;` in psql |
| Port 8080 already in use | Kill the other process or change `server.port` in application.properties |
| npm install fails | Make sure Node.js 16+ is installed |
