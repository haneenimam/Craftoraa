# Craftora — Handmade Crafts E-commerce

Craftora is a full-stack e-commerce web app for local artisans selling handmade crafts: pearl jewelry, crochet, ceramics, candles and home essentials. Shoppers browse and buy in English or Arabic; sellers manage their products; admins manage users, products and orders.

Built with the MERN stack (MongoDB, Express, React, Node.js) as a graduation project.

📘 **Full documentation** — architecture, data model, API, payments, configuration, deployment guide and troubleshooting: [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)

---

## Features

**Shoppers**
- Browse by category, search by name, filter by price
- Full English / Arabic interface (right-to-left in Arabic)
- Cart saved in the browser
- Checkout with cash on delivery, or by card through Stripe Checkout
- Sign up, log in, reset a forgotten password by email
- Contact form that emails the shop

**Sellers**
- Add and edit their own products
- See orders that include their products

**Admins**
- View, edit, delete users and change roles (User / Seller / Admin)
- Create Seller and Admin accounts
- Edit and delete any product
- Orders overview

---

## Tech stack

| Frontend | Backend |
|---|---|
| React 18 + Vite | Node.js + Express |
| React Router | MongoDB + Mongoose |
| Bootstrap / React-Bootstrap | JWT authentication, bcryptjs |
| Axios | Stripe Checkout |
| | Nodemailer (Gmail) |

---

## Project structure

```
Craftoraa/
├── backend/
│   ├── middleware/auth.js     # JWT check + role check
│   ├── models/                # User, Product, Order, Cart
│   ├── routes/                # auth, products, orders, admin, payment, contact, cart
│   ├── seed.js                # creates the first admin + sample products
│   ├── server.js              # Express app entry point
│   └── .env.example
└── frontend/
    ├── public/                # images, logo, SPA redirect rule
    ├── src/
    │   ├── Apis/config.js     # Axios instance (uses VITE_API_BASE_URL)
    │   ├── Components/        # Navbar, Footer, ProductCard, home sections
    │   ├── Context/           # Auth, Cart, Language providers
    │   ├── Pages/             # Shop pages, checkout, auth, admin dashboard
    │   └── App.jsx            # Routes
    └── .env.example
```

---

## Run it locally

**You need:** Node.js 18 or newer, and a MongoDB database — either a MongoDB Atlas connection string, or MongoDB running locally (for example with Docker):

```bash
docker run -d --name craftora-mongo -p 27017:27017 -v craftora-mongo-data:/data/db mongo:8.0
```

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values (see below)
npm run seed              # creates your admin account + 24 sample products
npm run dev               # or: npm start
```

The API runs on http://localhost:5000 — check http://localhost:5000/health.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 and log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you put in `backend/.env`.

---

## Environment variables

**`backend/.env`**

| Variable | Required | What it is |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string, e.g. `mongodb://localhost:27017/craftora` |
| `JWT_SECRET` | yes | Any long random string used to sign logins |
| `STRIPE_SECRET_KEY` | yes | Stripe secret key (`sk_test_...`). Any placeholder lets the server start; only card checkout needs a real key |
| `PORT` | no | Defaults to `5000` |
| `FRONTEND_URL` | when hosted | The live website address (no trailing `/`). Allows it through CORS and is where Stripe sends customers back |
| `EMAIL_USER`, `EMAIL_PASS` | for email | Gmail address + [app password](https://support.google.com/accounts/answer/185833), used for password reset and the contact form |
| `CONTACT_EMAIL` | no | Where contact-form messages go (defaults to `EMAIL_USER`) |
| `STRIPE_WEBHOOK_SECRET` | no | Only needed if you register a Stripe webhook |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | for seeding | The admin account `npm run seed` creates |

**`frontend/.env`**

| Variable | What it is |
|---|---|
| `VITE_API_BASE_URL` | Backend address without `/api`, e.g. `http://localhost:5000` |

> Public sign-up always creates a normal **User**. The first **Admin** comes from `npm run seed`; after that, admins can create Sellers and Admins from the dashboard.

---

## Hosting notes

- **Backend:** an always-on Node.js server. Run `npm install` then `npm start` in `backend/`, set the variables above (including `FRONTEND_URL`), and use `GET /health` as the health check — it returns `503` if the database is unreachable.
- **Frontend:** a static site. Set `VITE_API_BASE_URL` to the backend's address **before** running `npm run build`, then serve `frontend/dist/`. Every route must fall back to `index.html` (`public/_redirects` provides this rule for hosts that read that file).
- **Database:** if you use MongoDB Atlas, allow the backend's IP address under *Network Access*.

---

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` | Public |
| GET | `/api/auth/verify` | Logged in |
| POST | `/api/auth/forgot-password` · `/api/auth/reset-password` | Public |
| POST | `/api/auth/admin/register` | Admin |
| GET | `/api/products` (filters: `category`, `search`, `minPrice`, `maxPrice`, `page`, `limit`) · `/api/products/:id` | Public |
| GET | `/api/products/my-products` | Seller |
| POST / PUT / DELETE | `/api/products` · `/api/products/:id` | Admin, Seller (own products) |
| POST | `/api/orders` | Public |
| GET | `/api/orders/all` · PATCH `/api/orders/:id/status` | Admin, Seller |
| GET / PATCH / DELETE | `/api/admin/users` · `/api/admin/users/:id` | Admin |
| POST | `/api/payment/create-checkout-session` | Public |
| POST | `/api/contact` | Public |
| GET | `/health` | Public |

---

## Contact

Craftora was developed by Haneen Imam as a graduation project.

- LinkedIn: [linkedin.com/in/haneenimam](https://linkedin.com/in/haneenimam)
- Email: haneenimam99@gmail.com
