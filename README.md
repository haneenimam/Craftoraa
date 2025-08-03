# Craftoraa - Handmade Crafts E-commerce Platform

Craftoraa is a full-stack e-commerce web application designed to support local artisans in selling handmade crafts online. The application provides a seamless shopping experience for customers and robust product management tools for sellers and administrators. Built using the MERN (MongoDB, Express, React, Node.js) stack, it offers a secure, scalable, and responsive architecture suitable for real-world deployment.

---

## Project Overview

The goal of Craftoraa is to promote handmade and local crafts by providing a digital platform where:
- Buyers can browse and purchase products
- Sellers can manage their listings
- Admins can oversee platform-wide activity and user roles

The platform handles secure user authentication, role-based authorization, and online payments using Stripe.

---

## Technology Stack

### Frontend
- React with Vite
- Redux Toolkit
- React Router
- Axios
- Bootstrap

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Stripe for payment processing
- Nodemailer for contact and password recovery emails

---

## Core Features

### Buyer Features
- Browse products by category
- View detailed product pages
- Add or remove items from the cart
- Checkout securely using Stripe
- View past orders

### Seller Features
- Add new products (title, price, description, images)
- View and manage their own products
- Access their orders related to their listed items

### Admin Features
- View and manage all users
- Promote or demote users (User <-> Seller <-> Admin)
- Manage all products and platform-wide orders

---

## Authentication & Authorization

### Authentication
- Registration and login handled via `/api/auth`
- Passwords are securely hashed using `bcryptjs`
- JWTs are generated upon login and stored client-side

### Authorization
- Middleware enforces role-based access (User, Seller, Admin)
- Admin routes are protected by both authentication and role checks
- Frontend uses PrivateRoute wrappers for protected views

---

## Stripe Integration (Checkout & Payments)

- The application integrates Stripe Checkout on the frontend
- Payment processing happens via `/api/payment/create-checkout-session`
- Card details are handled securely by Stripe and are not stored
- Stripe Webhooks are set up to listen for successful payments and future event handling

---

## Database Design

The application uses MongoDB with the following main collections:

| Collection | Key Fields |
|------------|------------|
| **Users**  | firstName, lastName, email, password (hashed), role (User/Seller/Admin) |
| **Products** | title, description, price, category, stock, seller (ref), images (URLs) |
| **Orders** | user (ref), items[], shippingInfo, totalPrice, status |
| **Cart** | user (ref), items[] (product ref + quantity) |

---

## Project Structure

Craftoraa/
├── frontend/ # React Vite app
│ ├── public/
│ └── src/
│ ├── components/
│ ├── pages/
│ ├── redux/
│ └── main.jsx
│
├── backend/ # Express.js API
│ ├── routes/
│ ├── models/
│ ├── middleware/
│ ├── controllers/
│ └── server.js
│
├── README.md
└── .gitignore


## Getting Started (Run Locally)

### Prerequisites
- Node.js & npm
- MongoDB Atlas or local instance

### 1. Clone the Repository
git clone https://github.com/haneenimam/Craftoraa.git
cd Craftoraa
2. Setup Backend
cd backend
npm install
cp .env.example .env 
npm run dev
3. Setup Frontend
cd ../frontend
npm install
npm run dev
Frontend runs on: http://localhost:5173
Backend runs on: http://localhost:5000/api


![Homepage](screenshots/home.png)
![Product Page](screenshots/product.png)
![Admin Panel](screenshots/admin.png)

Future Improvements:
-Add product reviews and ratings
-Enable image uploads using cloud storage 
-Add delivery status notifications via email

Contact
Craftoraa was developed by Haneen Imam as a graduation project.
For inquiries or collaborations:
        LinkedIn: linkedin.com/in/haneenimam
        Email: haneenimam99@gmail.com