# Hotel Reservation System

A hotel reservation management platform built with **Next.js**, **SQL Server**, and **Node.js**. The system supports reservation management, invoicing, check-in/check-out, and admin dashboard functionalities.

---

## 🛠️ Tech Stack

- **Frontend & Backend**: Next.js (API Routes)
- **Database**: Microsoft SQL Server
- **ORM**: Custom SQL stored procedures with `mssql`
- **Scheduling**: `node-cron`
- **Auth**: JWT-based admin authentication
- **Env Handling**: `dotenv`

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hotel-reservation-system.git
cd hotel-reservation-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup `.env` Files

Create a `.env.local` file in the root directory and configure the following:

```env
DB_USER=
DB_PASSWORD=
DB_SERVER=
DB_NAME=
JWT_SECRET=
INTERNAL_CRON_SECRET=
```

Create a `.env` file in the root directory and configure the following:

```env
INTERNAL_CRON_SECRET=
```

---

## 🖥️ Running the App Locally

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 Admin Authentication

All admin APIs are protected using JWT-based middleware. Ensure you log in with an admin account to access routes under `/api/admin/*`.

---

## 🔄 Auto-Cancel Unconfirmed Reservations

Unconfirmed reservations are **automatically cancelled every day at 7:00 PM** via a background script.

### Script Location

```
lib/scripts/autoCancel.js
```

### How to Run the Script

1. **Ensure `.env` is set up** with `INTERNAL_CRON_SECRET`.

2. **Run once manually:**

```bash
npm run auto-cancel
```

> This runs:
```bash
npx node lib/scripts/autoCancel.js
```

3. **To keep it running on a schedule (e.g., daily):**

Either:
- Keep a terminal tab open:
  ```bash
  node lib/scripts/autoCancel.js
  ```
  It will run daily at the scheduled time using `node-cron`.

Or:
- Use a process manager like `pm2`:
  ```bash
  pm2 start lib/scripts/autoCancel.js --name auto-cancel
  ```

---

## 📦 Scripts

| Script             | Description                                 |
|--------------------|---------------------------------------------|
| `npm run dev`      | Starts the Next.js dev server               |
| `npm run build`    | Builds the app for production               |
| `npm run start`    | Runs the production build                   |
| `npm run auto-cancel` | Executes the auto-cancel script manually |
| `noe test/login.test.js` | Runs the login tests with selenium    |

---

## 🧪 Database

- All major actions (e.g., reservation updates, invoicing) are handled via **stored procedures**.
- Stored procedures include: `CreateInvoiceAndCheckout`, `GetAllReservationsForAdmin`, `GetReservationById`, etc.

### 🗄️ Database Setup

1. Open SQL Server Management Studio (SSMS).
2. Open the script at `/sql/hotel-db.sql`.
3. Run the script to create and populate the database.

---

## ✅ License

This project is for academic purposes under the coursework of ESOFT – **CS6003ES: Admin Module**.

---