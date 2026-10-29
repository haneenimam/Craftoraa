# Craftora — Project Overview

A complete guide to how Craftora works and what it needs to run: architecture, data model, API, frontend, configuration, deployment requirements, troubleshooting and known limitations.

For quick local setup, see the [README](../README.md).

**Contents**
1. [What Craftora is](#1-what-craftora-is)
2. [Architecture](#2-architecture)
3. [Tech stack](#3-tech-stack)
4. [Repository layout](#4-repository-layout)
5. [Backend](#5-backend)
6. [Data model](#6-data-model)
7. [Authentication and roles](#7-authentication-and-roles)
8. [API reference](#8-api-reference)
9. [Payments (Stripe)](#9-payments-stripe)
10. [Email](#10-email)
11. [Frontend](#11-frontend)
12. [Configuration](#12-configuration)
13. [Deployment guide](#13-deployment-guide)
14. [Troubleshooting](#14-troubleshooting)
15. [Known limitations and ideas for improvement](#15-known-limitations-and-ideas-for-improvement)
16. [Project history](#16-project-history)

---

## 1. What Craftora is

Craftora is a bilingual (English / Arabic) online marketplace for handmade crafts — pearl jewelry, crochet, ceramics, candles and home essentials — built as a graduation project with the MERN stack.

| Who | What they can do |
|---|---|
| **Visitor / shopper** | Browse by category, search, filter by price, view product details, add to cart, check out (cash on delivery or card), sign up, log in, reset password, contact the shop |
| **Seller** | Add products, edit their own products, see orders that contain their products |
| **Admin** | Everything a seller can do for *all* products, plus: view / edit / delete users, change roles, create Seller and Admin accounts, delete products, see all orders |

Prices are in Egyptian pounds (EGP) and checkout only ships within Egypt.

---

## 2. Architecture

Craftora is three independent pieces: a static React single-page app, a stateless Express REST API, and a MongoDB database. The API also talks to Stripe (card payments) and Gmail (emails).

```mermaid
flowchart LR
    B["Browser<br/>(shopper / seller / admin)"]
    FE["Frontend<br/>React SPA (static files)"]
    API["Backend<br/>Express REST API (Node.js)"]
    DB[("MongoDB<br/>(Atlas or self-hosted)")]
    ST["Stripe<br/>Checkout"]
    GM["Gmail SMTP"]

    B -- "loads HTML/JS/CSS + images" --> FE
    B -- "JSON over HTTPS<br/>Authorization: Bearer JWT" --> API
    API -- "Mongoose" --> DB
    API -- "create Checkout Session" --> ST
    B -- "redirect to pay, redirect back" --> ST
    API -- "password reset + contact emails" --> GM
```

Key points:

- **The frontend and backend are deployed separately** and can live on different domains. The frontend learns the API address at **build time** (`VITE_API_BASE_URL`); the backend only accepts browser requests from origins on its CORS allow-list (`FRONTEND_URL`).
- **The API is stateless.** Logins are JSON Web Tokens kept in the browser's `localStorage` and sent as `Authorization: Bearer <token>`. Nothing is stored in server memory, so the API can be restarted or scaled freely.
- **The cart lives in the browser** (`localStorage`), not in the database. It reaches the server only when an order is placed.
- **Prices are always taken from the database** when an order or payment is created — never from the browser.
- **Product images are URLs/paths stored on the product.** The sample products point to images in `frontend/public`, which the frontend serves itself.

---

## 3. Tech stack

| Layer | Technology (version from `package.json`) |
|---|---|
| Frontend framework | React 18.3, React Router 7.5 |
| Build tool / dev server | Vite 6.3 |
| UI | Bootstrap 5.3, React-Bootstrap 2.10, react-icons 5.5, react-slider 2.0, CSS Modules |
| HTTP client | Axios 1.9 (some pages use `fetch`) |
| Backend runtime | Node.js — **18 or newer** (tested on Node 24) |
| Web framework | Express 4.21, cors 2.8 |
| Database | MongoDB 8 (Atlas or self-hosted), Mongoose 8.15 |
| Auth | jsonwebtoken 9 (HS256), bcryptjs 3 |
| Payments | Stripe Node SDK 18.1 (Stripe Checkout) |
| Email | Nodemailer 7 (Gmail) |
| Config | dotenv 16.5 |
| Dev tooling | nodemon (backend), ESLint 9 (frontend) |

---

## 4. Repository layout

```
Craftoraa/
├── README.md                      Quick start
├── docs/
│   └── PROJECT_OVERVIEW.md        This document
├── backend/
│   ├── server.js                  App entry: env checks, middleware, routes, health, DB connect + listen
│   ├── seed.js                    Creates the first Admin + 24 sample products (npm run seed)
│   ├── middleware/
│   │   └── auth.js                `auth` (verifies JWT) and `roleCheck([...roles])`
│   ├── models/
│   │   ├── User.js                Users and roles
│   │   ├── Product.js             Products (flexible schema)
│   │   ├── Order.js               Orders with price snapshot
│   │   └── Cart.js                Server-side cart (API exists, UI does not use it)
│   ├── routes/
│   │   ├── auth.js                Register, login, verify, admin-create, forgot/reset password
│   │   ├── products.js            Product listing, details, CRUD, seller's products
│   │   ├── orders.js              Create order, list orders, update status
│   │   ├── admin.js               User management
│   │   ├── payment.js             Stripe Checkout session
│   │   ├── contact.js             Contact form email
│   │   └── cart.js                Server-side cart endpoints (unused by UI)
│   ├── vercel.json                Configuration left over from the project's original hosting
│   ├── .env.example               Template for backend/.env
│   └── package.json               Scripts: start, dev, seed
└── frontend/
    ├── index.html                 HTML shell, fonts, page title
    ├── vite.config.js
    ├── eslint.config.js
    ├── .env.example               Template for frontend/.env
    ├── public/                    Logo, hero slides, category images, default product image, 404 image, _redirects
    └── src/
        ├── main.jsx               Mounts <App/> inside Language → Cart → Auth providers; loads Bootstrap
        ├── App.jsx                All routes + layouts + ProtectedRoute wrappers
        ├── Apis/config.js         Axios instance using VITE_API_BASE_URL
        ├── Context/
        │   ├── Auth.jsx           Logged-in user (login / logout)
        │   ├── CartContext.jsx    Cart in localStorage; restore after cancelled card payment
        │   └── LanguageContext.jsx  en / ar, sets document direction (ltr / rtl)
        ├── Components/
        │   ├── Navbar/            Top bar (cart, login, language, dashboard menu) + category menu
        │   ├── Footer/
        │   ├── HeroSection/       Bootstrap carousel (h1–h3.jpg)
        │   ├── NewArrivals/       First 4 products
        │   ├── ShopByCategory/    Five category tiles
        │   ├── FeaturedProducts/  First 9 products, horizontal scroll
        │   ├── ProductCard/       Card used in product lists
        │   └── ScrollToTop/
        └── Pages/
            ├── Home/  ProductList/  CategoryProducts/  ProductDetails/
            ├── Cart/  Checkout/  Contact/
            ├── Login/  SignUp/  ForgotPassword/  ResetPassword/
            ├── Admin/             Create Seller/Admin form
            ├── Dashboard/
            │   ├── Dashboard/     Users overview (Admin)
            │   ├── ManageUsers/   Edit / delete users, change roles (Admin)
            │   ├── AdminView/     Product table: inline edit + delete (Admin)
            │   ├── EditProducts/  Add / edit products (Admin, Seller)
            │   └── OrdersPage/    Orders overview (Admin, Seller)
            ├── ProtectedRoute.jsx Verifies the token with the API before showing a protected page
            ├── Unauthorized.jsx
            └── NotFound/
```

---

## 5. Backend

### Startup sequence (`server.js`)

1. Load `backend/.env` (variables already set in the environment win).
2. **Exit immediately** if `MONGO_URI` or `STRIPE_SECRET_KEY` is missing.
3. Exit if a separate npm package called `router` is installed (it conflicts with Express's router).
4. Register the **Stripe webhook** route *before* the JSON parser (it needs the raw request body to verify signatures).
5. Parse JSON bodies (limit **10 KB**).
6. Apply **CORS**: requests with no `Origin` (server-to-server, curl) are allowed; browser requests are allowed only from the allow-list (localhost dev ports, three addresses from the original hosting, and `FRONTEND_URL`).
7. Apply a **30-second** per-request timeout (responds `503 Service timeout`).
8. Mount routes under `/api/...`, plus `GET /` and `GET /health`.
9. Final error handler: CORS rejections → `403 Origin not allowed`; anything else → `500 Internal server error` (details only in the server log).
10. **Connect to MongoDB** (up to 5 attempts, 30 s server-selection timeout, 5 s between attempts). Only after a successful connection does the server **listen** on `PORT` (default `5000`) on all interfaces. If all attempts fail, the process exits with code 1 so a process manager / host can restart it.

### Health check

`GET /health` → `200 {"status":"healthy","database":"connected"}` while MongoDB is connected, or `503 {"status":"unhealthy","database":"disconnected"}` if the connection drops. Use it as the hosting health check.

### Request validation and business rules

- **Orders** (`POST /api/orders`): every item must reference an existing product and have a whole-number quantity ≥ 1, with enough stock. All items are validated **before** any stock changes, so a rejected order never alters stock. The order stores the **current database price** of each item and the computed `totalPrice`. Stock is then decremented.
- **Card payments** (`POST /api/payment/create-checkout-session`): same validation; names and prices come from the database.
- **Product search** is case-insensitive over `name` and `title`; special characters are escaped.
- **Sellers** can only edit/delete their own products (`403` otherwise); admins can edit/delete any.
- **Admins** can't delete their own account or remove their own Admin role (prevents lock-out). Roles are validated against `User` / `Seller` / `Admin`; duplicate emails are rejected with `400`.
- Every async route is wrapped in `try/catch`, so a failure returns an error response instead of crashing the process.

---

## 6. Data model

```mermaid
erDiagram
    USER ||--o{ PRODUCT : "sells (seller)"
    USER |o--o{ ORDER : "placed by (optional)"
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "referenced by"
    USER ||--o| CART : "has (unused by UI)"
```

### User (`users`)

| Field | Type | Notes |
|---|---|---|
| `firstName`, `lastName` | String, required | |
| `email` | String, required, **unique** | Login identifier |
| `password` | String, required | bcrypt hash (never returned by the admin API) |
| `role` | `User` \| `Seller` \| `Admin` | Default `User` |
| `resetCode`, `resetCodeExpires` | String, Date | 4-digit password-reset code, valid 15 minutes |
| `createdAt`, `updatedAt` | Date | Automatic |

### Product (`products`)

The schema is intentionally flexible (`strict: false`) because it was designed to accept imported datasets; unknown fields are kept.

| Field | Type | Notes |
|---|---|---|
| `name` | String | Shown on the product page; used in search |
| `title` | String | Shown on cards; used in search. The app keeps `name` and `title` the same |
| `description` | String | |
| `price` | Number | EGP |
| `category` | String | **Must be exactly** `Jewelry`, `Crochet`, `Ceramics`, `Candles` or `Home Essential` to appear in the category pages and filters |
| `stock` | Number | Default 0; shown as "Low Stock" at ≤ 5, "Out of Stock" at 0 |
| `image` | String | Main image URL/path |
| `images` | [String] | Image URLs/paths (cards fall back to `images[0]`) |
| `seller` | ObjectId → User | Set automatically to the creator |
| `main_category`, `average_rating`, `rating_number`, `store` | — | Optional, for imported data |
| `createdAt`, `updatedAt` | Date | Automatic |

### Order (`orders`)

| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Optional; the checkout currently doesn't send it (guest checkout) |
| `shippingInfo` | `{ email, firstName, lastName, address, apartment, city, governorate, postalCode, phone, country }` | |
| `paymentMethod` | String | `Cash on Delivery` or `Card` |
| `items` | `[{ product → Product, quantity, price }]` | `price` is the snapshot at order time |
| `totalPrice` | Number | Computed by the server |
| `status` | `processing` \| `shipped` \| `delivered` \| `cancelled` | Default `processing` |
| `createdAt`, `updatedAt` | Date | Automatic |

No card details are stored — card data only ever goes to Stripe.

### Cart (`carts`)

`{ user (unique) → User, items: [{ product → Product, quantity }] }`. The API endpoints exist but the frontend keeps the cart in the browser instead.

### Seed data (`npm run seed`)

`backend/seed.js` connects with `MONGO_URI` and:
1. Creates an Admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (or, if that email exists, promotes it to Admin without changing its password).
2. Inserts 24 sample products — 6 Jewelry (mostly pearl necklaces), 6 Crochet, 6 Ceramics (mostly mugs), 3 Candles, 3 Home Essential — **only if the products collection is empty**, so it is safe to run more than once.

---

## 7. Authentication and roles

- **Passwords** are hashed with bcrypt (10 salt rounds).
- **Login** (`POST /api/auth/login`) returns a JWT signed with `JWT_SECRET` (HS256), valid for **1 hour**, containing `{ id, role }`, plus the user's name, email and role.
- The frontend stores the token in `localStorage.token` and the user in `localStorage.loggedInUser` (role lower-cased for display).
- **Protected API routes** use `auth` (validates the Bearer token → `401` missing, `400` invalid) and `roleCheck([...])` (→ `403`).
- **Protected pages** use `ProtectedRoute`, which calls `GET /api/auth/verify`:
  - valid token with an allowed role → show the page
  - valid token, wrong role → `/unauthorized`
  - missing / expired / invalid token → clear the session and go to `/login`
  - API unreachable → "Could not reach the server" message
- **Logout** removes both the token and the stored user.

| Role | How you get it |
|---|---|
| User | Public sign-up (always creates `User`, whatever the request says) |
| Seller / Admin | Created by an Admin (Dashboard → Create Admin/Seller) or promoted in Manage Users |
| First Admin | `npm run seed` (there is no other way to create the first one) |

**Password reset:** `POST /api/auth/forgot-password` stores a 4-digit code (15 min) and emails it via Gmail; the frontend then goes to `/reset-password/:userId`, where `POST /api/auth/reset-password` checks the code and sets the new password.

---

## 8. API reference

Base URL: the backend address (e.g. `http://localhost:5000`). All bodies are JSON. "Auth" means `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method & path | Access | Body → Response |
|---|---|---|
| `POST /register` | Public | `{firstName, lastName, email, password}` → `201 {message, user}` (role always `User`) |
| `POST /login` | Public | `{email, password}` → `200 {token, user}` / `400` |
| `GET /verify` | Auth | → `200 {user: {id, role, iat, exp}}` / `401` / `403` |
| `POST /admin/register` | Admin | `{firstName, lastName, email, password, role: "Seller"\|"Admin"}` → `201` |
| `POST /forgot-password` | Public | `{email}` → `200 {success, userId}` / `404` / `500` if email isn't configured |
| `POST /reset-password` | Public | `{userId, email, code, newPassword}` → `200` / `400 Invalid or expired code` |

### Products — `/api/products`

| Method & path | Access | Notes |
|---|---|---|
| `GET /` | Public | Query: `category`, `search`, `minPrice`, `maxPrice`, `page` (default 1), `limit` (default 20). Returns `{total, page, limit, products}` |
| `GET /:id` | Public | Single product / `404` |
| `GET /my-products` | Seller | The seller's own products |
| `POST /` | Admin, Seller | Create; `seller` is set to the caller |
| `PUT /:id` | Admin (any), Seller (own) | Partial update; keeps the existing `image` if none sent; `403` for another seller's product |
| `DELETE /:id` | Admin (any), Seller (own) | |

### Orders — `/api/orders`

| Method & path | Access | Notes |
|---|---|---|
| `POST /` | Public | `{items: [{product, quantity}], shippingInfo, paymentMethod}` → `201` order. Server computes prices and total |
| `GET /` | Auth | Orders whose `user` is the caller (the UI doesn't use this yet) |
| `GET /all` | Admin, Seller | Admin: all orders. Seller: orders containing their products. Newest first, products populated |
| `PATCH /:id/status` | Admin, Seller | `{status}`; sellers only if every item is theirs (no UI yet) |

### Admin — `/api/admin`

| Method & path | Access | Notes |
|---|---|---|
| `GET /users` | Admin | All users without passwords |
| `PATCH /users/:id` | Admin | `{firstName?, lastName?, email?, role?}`; `400` for invalid role, duplicate email, or demoting yourself |
| `DELETE /users/:id` | Admin | Also deletes their server-side cart; `400` for your own account |

### Payment, contact, cart, health

| Method & path | Access | Notes |
|---|---|---|
| `POST /api/payment/create-checkout-session` | Public | `{items: [{product, quantity}]}` → `{url}` (Stripe hosted page) |
| `POST /api/payment/webhook` | Stripe | Verifies the `stripe-signature` header with `STRIPE_WEBHOOK_SECRET`; logs the event type |
| `POST /api/contact` | Public | `{name, email, message}` → emails the shop; `500` if email isn't configured |
| `GET /api/cart`, `POST /api/cart` | Auth | Server-side cart (unused by UI) |
| `GET /health` | Public | See [Health check](#health-check) |
| `GET /` | Public | `{status: "success", message, timestamp}` |

---

## 9. Payments (Stripe)

Card payments use **Stripe Checkout** (Stripe's hosted payment page), so card details never touch Craftora's servers.

```mermaid
sequenceDiagram
    participant B as Browser (Checkout page)
    participant API as Express API
    participant DB as MongoDB
    participant S as Stripe
    B->>API: POST /api/payment/create-checkout-session {items:[{product, quantity}]}
    API->>DB: look up name, price, stock of each product
    API->>S: create Checkout Session (EGP, success/cancel URLs built from FRONTEND_URL)
    S-->>API: session.url
    API-->>B: {url}
    B->>B: save backupCart + pendingOrder in localStorage, empty the cart
    B->>S: redirect to Stripe's payment page
    alt customer pays
        S-->>B: redirect to FRONTEND_URL/checkout?payment=success
        B->>API: POST /api/orders (pendingOrder)
        API->>DB: validate, save order, decrement stock
        B->>B: clear pendingOrder + backupCart, "Payment successful"
    else customer cancels
        S-->>B: redirect to FRONTEND_URL/checkout?payment=cancelled
        B->>B: restore cart from backupCart, "Payment was cancelled"
    end
```

- `pendingOrder` is removed as soon as the return is processed, so refreshing the success page cannot create a duplicate order.
- If the customer leaves Stripe with the browser's Back button, the cart is restored from `backupCart` the next time the app loads.
- **Test mode:** with a `sk_test_...` key, pay with card `4242 4242 4242 4242`, any future expiry, any CVC.
- **Webhook (optional):** a Stripe webhook can be pointed at `<backend>/api/payment/webhook` with its signing secret in `STRIPE_WEBHOOK_SECRET`. The server verifies the signature and logs the event; it doesn't act on it yet (see limitations).

---

## 10. Email

Both the **password-reset code** and the **contact form** are sent with Nodemailer through Gmail, using `EMAIL_USER` and a Gmail **app password** in `EMAIL_PASS` (requires 2-Step Verification on that Google account).

- Contact messages are sent **from** `EMAIL_USER` **to** `CONTACT_EMAIL` (or `EMAIL_USER` if unset), with **Reply-To** set to the visitor, so replying goes straight to them.
- Without email settings, both features return an error message to the user; the server keeps running.

---

## 11. Frontend

### Providers and layout

`main.jsx` wraps the app as `LanguageProvider → CartProvider → AuthProvider → App` and loads Bootstrap's CSS and JS. Most pages are lazy-loaded. Shop and dashboard pages use a Navbar + Footer layout; login/sign-up/reset pages use Footer only.

### Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home: hero carousel, New Arrivals, Shop by Category, Featured Products | Public |
| `/product-list` | All products: search, category, price slider, pagination (20 per page) | Public |
| `/category-products?category=…` | Products in one category | Public |
| `/product/:id` | Product details, quantity, Buy Now | Public |
| `/cart` | Cart | Public |
| `/checkout` | Shipping form + Cash on Delivery / Card; handles the Stripe return | Public |
| `/contact` | Contact form | Public |
| `/login`, `/signup`, `/forgot-password`, `/reset-password/:userId` | Account pages | Public |
| `/dashboard` | Users overview | Admin |
| `/dashboard/manage-users` | Edit / delete users, change roles | Admin |
| `/admin/create-user` | Create Seller or Admin | Admin |
| `/dashboard/products` | Product table: inline edit, delete | Admin |
| `/dashboard/edit-products` | Add / edit products | Admin, Seller |
| `/dashboard/orders` | Orders overview | Admin, Seller |
| `/unauthorized`, `*` | Access denied / 404 | Public |

Because this is a single-page app, **the host must serve `index.html` for every path** (see [deployment](#13-deployment-guide)).

### Browser storage

| Key | Holds |
|---|---|
| `token` | JWT |
| `loggedInUser` | `{firstName, lastName, email, role}` for the navbar |
| `cart` | Cart items |
| `backupCart`, `pendingOrder` | Only while a card payment is in progress |
| `language` | `en` or `ar` |
| `lastShoppingPage` | Where "Continue Shopping" returns to |

### Language and direction

Text is translated inline (`language === "ar" ? … : …`). Choosing Arabic sets `document.dir = "rtl"`. Category labels are translated for display, but the value sent to the API is always the English category name.

### Calling the API

`src/Apis/config.js` exports an Axios instance whose base URL is `import.meta.env.VITE_API_BASE_URL`; a few pages call `axios`/`fetch` with the same variable. **Vite inlines this value at build time** — changing it requires a rebuild.

---

## 12. Configuration

### `backend/.env` (template: `backend/.env.example`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | **Yes** | MongoDB connection string **including the database name**, e.g. `mongodb+srv://USER:PASS@cluster.xxxxx.mongodb.net/craftora?retryWrites=true&w=majority` or `mongodb://localhost:27017/craftora` |
| `JWT_SECRET` | **Yes** | Long random string. Changing it logs everyone out |
| `STRIPE_SECRET_KEY` | **Yes** (server won't start without it) | `sk_test_...` / `sk_live_...`. A placeholder starts the server; only card checkout needs a real key |
| `PORT` | No | Default `5000`. Many hosts set this automatically |
| `FRONTEND_URL` | **When hosted** | Exact frontend origin, e.g. `https://craftora.example.com` — scheme + host, no path, no trailing `/`. Used for CORS and Stripe return URLs |
| `EMAIL_USER` / `EMAIL_PASS` | For email features | Gmail address and app password |
| `CONTACT_EMAIL` | No | Contact-form recipient (default `EMAIL_USER`) |
| `STRIPE_WEBHOOK_SECRET` | No | `whsec_...`, only if a Stripe webhook is configured |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Only for `npm run seed` | First admin account |

### `frontend/.env` (template: `frontend/.env.example`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | **Yes** | Backend address without `/api` and without a trailing `/`, e.g. `https://api.craftora.example.com`. **Baked in at build time.** |

`.env` files are git-ignored. Never commit real secrets.

### Scripts

| Where | Command | Does |
|---|---|---|
| backend | `npm start` | Run the API |
| backend | `npm run dev` | Run with auto-restart (nodemon) |
| backend | `npm run seed` | Create first admin + sample products |
| frontend | `npm run dev` | Dev server on http://localhost:5173 |
| frontend | `npm run build` | Production build → `frontend/dist/` |
| frontend | `npm run preview` | Serve the production build locally |
| frontend | `npm run lint` | ESLint |

---

## 13. Deployment guide

Craftora is deployed as **three parts**. This section lists what each part needs, independent of which hosting provider is used.

| Part | What it is | Needs |
|---|---|---|
| Database | MongoDB (developed and tested on 8.0) | Reachable from the backend |
| Backend | Long-running Node.js process | Node 18+, env vars, outbound internet |
| Frontend | Static files (`frontend/dist/`) | Any static web server with SPA fallback |

### Step 1 — Database

1. Create a MongoDB database (e.g. a MongoDB Atlas cluster). Choose a region close to the users and **outside regions with ongoing provider incidents**.
2. Create a database user with read/write access (the app only needs *readWrite*).
3. Allow network access from the backend's outbound IP addresses. If the host's IPs aren't fixed, allow `0.0.0.0/0` and rely on a strong password.
4. Build the connection string and add the database name before the `?` (`…mongodb.net/craftora?…`).
5. From a machine that can reach the database, put the string in `backend/.env` and run `npm run seed` to create the first admin and sample products.

### Step 2 — Backend

1. Source directory: `backend/`.
2. Install: `npm install` (or `npm ci`). Start: `npm start`.
3. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `FRONTEND_URL` (fill in once the frontend address is known), and optionally `EMAIL_USER`, `EMAIL_PASS`, `CONTACT_EMAIL`, `STRIPE_WEBHOOK_SECRET`. Use `PORT` if the host assigns one.
4. Health check: `GET /health` (expects `200`).
5. Outbound network access required: MongoDB (DNS SRV lookups + TCP 27017 for Atlas), Stripe API (HTTPS 443), Gmail SMTP (`smtp.gmail.com`, TLS).
6. The process exits after 5 failed database connection attempts, so the host should restart it automatically.
7. Serve it over **HTTPS** (browsers block an HTTP API from an HTTPS page).

### Step 3 — Frontend

1. Source directory: `frontend/`.
2. Set `VITE_API_BASE_URL` to the backend's public HTTPS address **before building**.
3. Build: `npm install && npm run build`. Publish the `frontend/dist/` folder.
4. Configure **SPA fallback**: every path that isn't a real file must return `index.html` with status 200. (`public/_redirects` contains `/* /index.html 200` for hosts that read that file format.)
5. Serve over HTTPS.

### Step 4 — Connect the pieces

1. Set the backend's `FRONTEND_URL` to the frontend's exact origin and restart the backend.
2. If using a Stripe webhook: create it for `<backend>/api/payment/webhook` and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
3. Optional cleanup: `server.js` still allows three addresses from the original hosting in `allowedOrigins`; remove them if they're no longer yours.

### Step 5 — Verify after deploying

- [ ] `GET <backend>/health` → `{"status":"healthy","database":"connected"}`
- [ ] Home page shows New Arrivals and Featured Products (no "Error fetching products")
- [ ] Refreshing a deep link such as `/product-list` or `/dashboard` loads the app (SPA fallback works)
- [ ] Category pages and the product list filters show products; switching to Arabic still filters correctly
- [ ] Log in with the admin account; the Dashboard menu appears (desktop and phone)
- [ ] Cash on delivery order succeeds and appears under Dashboard → Orders
- [ ] Card checkout redirects to Stripe (needs a real test key); paying returns to the site and saves the order; cancelling restores the cart
- [ ] Contact form and Forgot Password send emails (needs Gmail settings)
- [ ] Browser console shows no CORS errors (if it does, check `FRONTEND_URL`)

### Going-live checklist (security)

- Generate a fresh, long `JWT_SECRET` for production.
- Use a dedicated database user with only *readWrite*, and rotate any password that has been shared.
- Keep Stripe in **test mode** unless real payments are intended; never commit keys.
- Remove `ADMIN_PASSWORD` from the hosted environment after seeding (it's only used by the seed script).
- Keep `.env` files out of git (already ignored).

---

## 14. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend exits with `ERROR: Missing required environment variables` | `MONGO_URI` or `STRIPE_SECRET_KEY` not set | Set both (a placeholder Stripe key is fine for starting) |
| `DB Connection failed … querySrv ENOTFOUND` | Wrong cluster host, or the cluster was deleted | Copy a fresh connection string from the database provider |
| `DB Connection failed … bad auth` | Wrong database username/password | Check the user; URL-encode special characters in the password |
| `DB Connection failed … Server selection timed out` | Backend's IP not allowed, or cluster paused | Add the IP / `0.0.0.0/0` in network access; resume the cluster |
| Every endpoint, even `/health`, fails | The server never started (it only listens after the DB connects) | Check the backend logs for the connection error above |
| Browser console: CORS error / API returns `403 Origin not allowed` | `FRONTEND_URL` doesn't exactly match the site's origin | Set it to `https://your-site` (no trailing `/`) and restart |
| Site works locally but the live site calls `localhost` | `VITE_API_BASE_URL` wasn't set when building | Set it and **rebuild** the frontend |
| Refreshing a page gives a 404 | No SPA fallback on the static host | Serve `index.html` for all paths |
| Card checkout: "Failed to place order" | Invalid / placeholder `STRIPE_SECRET_KEY` | Add a real `sk_test_...` key |
| Contact / Forgot Password: "could not send" | Gmail not configured or wrong app password | Set `EMAIL_USER` / `EMAIL_PASS` (app password, not the normal password) |
| Logged out after about an hour | JWT expires after 1 h | Log in again (by design) |
| A product doesn't appear under its category | `category` isn't one of the five exact values | Edit it to `Jewelry`, `Crochet`, `Ceramics`, `Candles` or `Home Essential` |
| Can't create the first admin | Sign-up always creates `User` | Run `npm run seed` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` |

---

## 15. Known limitations and ideas for improvement

These are deliberate scope limits of a graduation project, listed so nobody is surprised:

- **Card orders are recorded by the browser** after Stripe redirects back. A production shop would create the order from the verified Stripe webhook (`checkout.session.completed`) instead; the webhook endpoint already verifies signatures and is the natural place to add this.
- **Orders aren't linked to user accounts** (checkout is guest-style), so there is no "My orders" page yet, although `GET /api/orders` exists.
- **No order-status UI** — `PATCH /api/orders/:id/status` exists but the dashboard only displays status.
- **Images are URLs**, not uploads; there is no image hosting.
- **Edit Products** lists every product for sellers too (they can only *save* their own).
- **Sessions last 1 hour** with no refresh token.
- **No rate limiting** on login, password reset (4-digit code) or contact form.
- `forgot-password` reveals whether an email is registered.
- The server-side **Cart** API is unused by the frontend.
- Two ESLint errors in `App.jsx` are false positives (`Component` used as JSX) from the lint configuration.
- Ideas: product reviews and ratings, image uploads, order-status emails, "My orders", admin analytics.

---

## 16. Project history

- **2025** — Built as a graduation project; frontend and backend hosted separately with a free MongoDB Atlas cluster.
- **2026** — The original database cluster was in the AWS Bahrain region (`me-south-1`), which became unavailable after a regional AWS outage that began in March 2026. MongoDB reported no recovery path for data held only in that region, so the original data could not be restored.
- **October 2026** — Restored on a new database: added `seed.js` to recreate the admin account and catalogue, fixed broken admin, checkout, payment, authentication and layout flows, removed unused files, and rewrote the documentation. Verified with automated API and browser tests on both the development and production builds.
