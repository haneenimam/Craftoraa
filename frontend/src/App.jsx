import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";
import ProtectedRoute from "./Pages/ProtectedRoute";
import "./index.css";


const Home = lazy(() => import("./Pages/Home/Home"));
const ProductList = lazy(() => import("./Pages/ProductList/ProductList"));
const ProductDetails = lazy(() => import("./Pages/ProductDetails/ProductDetails"));
const Cart = lazy(() => import("./Pages/Cart/Cart"));
const Checkout = lazy(() => import("./Pages/Checkout/Checkout"));
const Login = lazy(() => import("./Pages/Login/Login"));
const Signup = lazy(() => import("./Pages/SignUp/Signup"));
const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard/Dashboard"));
const ManageUsers = lazy(() => import("./Pages/Dashboard/ManageUsers/ManageUsers"));
const EditProducts = lazy(() => import("./Pages/Dashboard/EditProducts/EditProducts"));
const OrdersPage = lazy(() => import("./Pages/Dashboard/OrdersPage/OrdersPage"));
const AdminView = lazy(() => import("./Pages/Dashboard/AdminView/AdminView"));
const Contact = lazy(() => import("./Pages/Contact/Contact"));
const CategoryProducts = lazy(() => import("./Pages/CategoryProducts/CategoryProducts"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword/ResetPassword"));
const Unauthorized = lazy(() => import("./Pages/Unauthorized"));
const AdminCreateUser = lazy(() => import("./Pages/Admin/AdminCreateUser"));
const NotFound = lazy(() => import("./Pages/NotFound/NotFound"));



const LayoutWithNavbarFooter = ({ Component }) => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    </main>
    <Footer />
  </div>
);

const LayoutWithFooterOnly = ({ Component }) => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <main style={{ flex: 1 }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Component />
      </Suspense>
    </main>
    <Footer />
  </div>
);

const App = () => {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LayoutWithNavbarFooter Component={Home} />} />
          <Route path="/product-list" element={<LayoutWithNavbarFooter Component={ProductList} />} />
          <Route path="/product/:id" element={<LayoutWithNavbarFooter Component={ProductDetails} />} />
          <Route path="/cart" element={<LayoutWithNavbarFooter Component={Cart} />} />
          <Route path="/contact" element={<LayoutWithNavbarFooter Component={Contact} />} />
          <Route path="/category-products" element={<LayoutWithNavbarFooter Component={CategoryProducts} />} />
          <Route path="/checkout" element={<LayoutWithNavbarFooter Component={Checkout} />} />


          {/* Auth Routes (Footer Only) */}
          <Route path="/login" element={<LayoutWithFooterOnly Component={Login} />} />
          <Route path="/signup" element={<LayoutWithFooterOnly Component={Signup} />} />
          <Route path="/forgot-password" element={<LayoutWithFooterOnly Component={ForgotPassword} />} />
          <Route path="/reset-password/:userId" element={<LayoutWithFooterOnly Component={ResetPassword} />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["Admin", "Seller", "Buyer"]}>
              <LayoutWithNavbarFooter Component={Dashboard} />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/manage-users" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <LayoutWithNavbarFooter Component={ManageUsers} />
            </ProtectedRoute>
          } />

          <Route path="/admin/create-user" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <LayoutWithNavbarFooter Component={AdminCreateUser} />
            </ProtectedRoute>
          } />


          <Route path="/dashboard/products" element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <LayoutWithNavbarFooter Component={AdminView} />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/edit-products" element={
            <ProtectedRoute allowedRoles={["Admin", "Seller"]}>
              <LayoutWithNavbarFooter Component={EditProducts} />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/orders" element={
            <ProtectedRoute allowedRoles={["Admin", "Seller"]}>
              <LayoutWithNavbarFooter Component={OrdersPage} />
            </ProtectedRoute>
          } />

          {/* Unauthorized & Not Found */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;