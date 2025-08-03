import React, { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.css";
import { FaShoppingCart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext";
import { useCart } from "../../Context/CartContext";
import { useAuth } from "../../Context/Auth";

const categoryMap = {
  jewelry: "Jewelry",
  crochet: "Crochet",
  candles: "Candles",
  ceramic: "Ceramics",
  "home essential": "Home Essential",
};

const categories = [
  { key: "all-products", labelEn: "All Products", labelAr: "كل المنتجات" },
  { key: "jewelry", labelEn: "Jewelry", labelAr: "إكسسوارات" },
  { key: "candles", labelEn: "Candles", labelAr: "شموع" },
  { key: "crochet", labelEn: "Crochet", labelAr: "كروشيه" },
  { key: "ceramic", labelEn: "Ceramics", labelAr: "سيراميك" },
  {
    key: "home essential",
    labelEn: "Home Essential",
    labelAr: "الاحتياجات المنزلية",
  },
];

const Navbar = () => {
  const { language, changeLanguage } = useLanguage();
  const { cart, clearCart } = useCart();
  const { user, logout } = useAuth();
  const cartCount = cart.length;
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const productsDropdownRef = useRef(null);
  const dashboardDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);

  const dropdownTimerRef = useRef(null);
  const oppositeLang = language === "en" ? "ar" : "en";

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setProductsDropdownOpen(false);
        setDashboardDropdownOpen(false);
        setLanguageDropdownOpen(false);
        clearTimeout(dropdownTimerRef.current);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(dropdownTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideProducts =
        productsDropdownRef.current &&
        !productsDropdownRef.current.contains(event.target);
      const clickedOutsideDashboard =
        dashboardDropdownRef.current &&
        !dashboardDropdownRef.current.contains(event.target);
      const clickedOutsideLanguage =
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target);

      if (
        clickedOutsideProducts &&
        clickedOutsideDashboard &&
        clickedOutsideLanguage
      ) {
        setProductsDropdownOpen(false);
        setDashboardDropdownOpen(false);
        setLanguageDropdownOpen(false);
        clearTimeout(dropdownTimerRef.current);
      }
    };

    if (productsDropdownOpen || dashboardDropdownOpen || languageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [productsDropdownOpen, dashboardDropdownOpen, languageDropdownOpen]);

  const handleCategoryNavigation = (categoryLabelEn, key) => {
    clearTimeout(dropdownTimerRef.current);
    if (key === "all-products") {
      navigate("/product-list");
    } else {
      const backendCategory = categoryMap[key.toLowerCase()] || categoryLabelEn;
      navigate(
        `/category-products?category=${encodeURIComponent(backendCategory)}`
      );
    }
    if (isMobile) setProductsDropdownOpen(false);
  };

  const handleDropdownClick = (dropdownType) => {
    if (dropdownType !== "products") setProductsDropdownOpen(false);
    if (dropdownType !== "dashboard") setDashboardDropdownOpen(false);
    if (dropdownType !== "language") setLanguageDropdownOpen(false);

    if (dropdownType === "products") setProductsDropdownOpen((prev) => !prev);
    if (dropdownType === "dashboard") setDashboardDropdownOpen((prev) => !prev);
    if (dropdownType === "language") setLanguageDropdownOpen((prev) => !prev);

    clearTimeout(dropdownTimerRef.current);

    if (isMobile) {
      dropdownTimerRef.current = setTimeout(() => {
        setProductsDropdownOpen(false);
        setDashboardDropdownOpen(false);
        setLanguageDropdownOpen(false);
      }, 5000);
    }
  };

  const handleMouseEnter = (setter) => {
    if (!isMobile) setter(true);
  };

  const handleMouseLeave = (setter) => {
    if (!isMobile) setter(false);
  };

  const handleLanguageChange = () => {
    changeLanguage(oppositeLang);
    setLanguageDropdownOpen(false);
  };

  const handleDashboardLinkClick = () => {
    setDashboardDropdownOpen(false);
  };

  return (
    <header className={styles.mainNavbar}>
      {/* Top Navbar */}
      <div className={`${styles.topNavbar} py-2`}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className={styles.logo}>
            <Link to="/" className={styles.topNavbarBrandHover}>
              <img
                src="/logo.jpg"
                alt="LocalMarket Logo"
                className={styles.logoImage}
              />
            </Link>
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link
              to="/cart"
              className={`${styles.cartIcon} ${styles.cartIconHover} position-relative`}
            >
              <FaShoppingCart size={22} />
              {cartCount > 0 && (
                <span
                  className={`position-absolute top-0 start-100 translate-middle ${styles.cartBadge} rounded-pill bg-danger`}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div
                className={`dropdown ${styles.userDropdownWrapper}`}
                onMouseEnter={() => setUserDropdownOpen(true)}
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <button
                  className={`btn btn-sm dropdown-toggle ${styles.userBox}`}
                  type="button"
                >
                  {`Hi, ${user.firstName} (${user.role})`}
                </button>
                <ul
                  className={`dropdown-menu ${styles.profileDropdownMenu} ${userDropdownOpen ? "show" : ""
                    }`}
                >
                  <li>
                    <button
                      className={`dropdown-item ${styles.logoutItem}`}
                      onClick={() => {
                        logout();
                        clearCart();
                        navigate("/");
                      }}
                    >
                      {language === "ar" ? "تسجيل الخروج" : "Logout"}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${styles.topNavbarLink} ${styles.topNavbarLinkHover} nav-link`}
                >
                  {language === "ar" ? "تسجيل الدخول" : "Login"}
                </Link>
                <Link
                  to="/signup"
                  className={`${styles.topNavbarLink} ${styles.topNavbarLinkHover} nav-link`}
                >
                  {language === "ar" ? "التسجيل" : "Register"}
                </Link>
              </>
            )}

            <div
              ref={languageDropdownRef}
              className={`dropdown ${styles.langDropdownWrapper} ${styles.langHideOnMobile}`}
              onMouseEnter={() => handleMouseEnter(setLanguageDropdownOpen)}
              onMouseLeave={() => handleMouseLeave(setLanguageDropdownOpen)}
            >
              <button
                className={`btn btn-sm dropdown-toggle ${styles.langBox}`}
                type="button"
                onClick={() => handleDropdownClick("language")}
              >
                {language.toUpperCase()}
              </button>
              <ul
                className={`dropdown-menu ${styles.langDropdown} ${languageDropdownOpen ? "show" : ""
                  }`}
              >
                <li>
                  <button
                    className={`dropdown-item ${styles.langDropdownItem}`}
                    onClick={handleLanguageChange}
                  >
                    {oppositeLang.toUpperCase()}
                  </button>
                </li>
              </ul>
            </div>

            {!isMobile &&
              user &&
              (user.role === "admin" || user.role === "seller") && (
                <div
                  ref={dashboardDropdownRef}
                  className={`dropdown ${styles.dashboardDropdownWrapper}`}
                  onMouseEnter={() =>
                    handleMouseEnter(setDashboardDropdownOpen)
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(setDashboardDropdownOpen)
                  }
                >
                  <span
                    className={`nav-link dropdown-toggle ${styles.topNavbarLink} ${styles.topNavbarLinkHover}`}
                    onClick={() => handleDropdownClick("dashboard")}
                    style={{ cursor: "pointer" }}
                  >
                    {language === "ar" ? "لوحة التحكم" : "Dashboard"}
                  </span>
                  <ul
                    className={`dropdown-menu ${styles.dashboardDropdown} ${dashboardDropdownOpen ? "show" : ""
                      }`}
                  >
                    {user.role === "admin" && (
                      <>
                        <li>
                          <Link
                            to="/admin/create-user"
                            className={`dropdown-item ${styles.dashboardDropdownItem}`}
                            onClick={handleDashboardLinkClick}
                          >
                            {language === "ar" ? "إنشاء مستخدم بصلاحيات" : "Create Admin/Seller"}
                          </Link>
                        </li>

                        <li>
                          <Link
                            to="/dashboard"
                            className={`dropdown-item ${styles.dashboardDropdownItem}`}
                            onClick={handleDashboardLinkClick}
                          >
                            {language === "ar" ? "الرئيسية" : "Main"}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard/manage-users"
                            className={`dropdown-item ${styles.dashboardDropdownItem}`}
                            onClick={handleDashboardLinkClick}
                          >
                            {language === "ar"
                              ? "إدارة المستخدمين"
                              : "Manage Users"}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard/edit-products"
                            className={`dropdown-item ${styles.dashboardDropdownItem}`}
                            onClick={handleDashboardLinkClick}
                          >
                            {language === "ar"
                              ? "تعديل المنتجات"
                              : "Edit Products"}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard/orders"
                            className={`dropdown-item ${styles.dashboardDropdownItem}`}
                            onClick={handleDashboardLinkClick}
                          >
                            {language === "ar" ? "الطلبات" : "Orders"}
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/dashboard/products"
                            className={`dropdown-item ${styles.dashboardDropdownItem}`}
                            onClick={handleDashboardLinkClick}
                          >
                            {language === "ar"
                              ? "إدارة المنتجات"
                              : "Admin Products"}
                          </Link>
                        </li>
                      </>
                    )}
                    {user.role === "seller" && (
                      <li>
                        <Link
                          to="/dashboard/edit-products"
                          className={`dropdown-item ${styles.dashboardDropdownItem}`}
                          onClick={handleDashboardLinkClick}
                        >
                          {language === "ar"
                            ? "تعديل المنتجات"
                            : "Edit Products"}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      <nav className={`navbar navbar-expand-lg ${styles.bottomNavbar}`}>
        <div className="container">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#bottomNavbar"
            aria-controls="bottomNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="bottomNavbar">
            <ul
              className={`navbar-nav me-auto mb-2 mb-lg-0 ${styles.bottomNavbarNav}`}
            >
              <li className={`nav-item ${styles.bottomNavbarNavItem}`}>
                <Link
                  to="/"
                  className={`nav-link ${styles.navLink} ${styles.navLinkHover}`}
                >
                  {language === "ar" ? "الرئيسية" : "Home"}
                </Link>
              </li>

              <li
                ref={productsDropdownRef}
                className={`nav-item dropdown ${styles.bottomNavbarNavItem} ${styles.dropdownNav}`}
                onMouseEnter={() => handleMouseEnter(setProductsDropdownOpen)}
                onMouseLeave={() => handleMouseLeave(setProductsDropdownOpen)}
              >
                <span
                  className={`nav-link dropdown-toggle ${styles.navLink} ${styles.navLinkHover}`}
                  onClick={() => handleDropdownClick("products")}
                  style={{ cursor: "pointer" }}
                >
                  {language === "ar" ? "المنتجات" : "Products"}
                </span>
                <ul
                  className={`dropdown-menu ${styles.productNavDropdown} ${productsDropdownOpen ? "show" : ""
                    }`}
                >
                  {categories.map(({ key, labelEn, labelAr }) => (
                    <li key={key}>
                      <button
                        type="button"
                        className={`dropdown-item ${styles.productNavDropdownItem}`}
                        onClick={() => handleCategoryNavigation(labelEn, key)}
                      >
                        {language === "ar" ? labelAr : labelEn}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>

              {isMobile &&
                user &&
                (user.role === "admin" || user.role === "seller") && (
                  <li
                    ref={dashboardDropdownRef}
                    className={`nav-item dropdown ${styles.bottomNavbarNavItem} ${styles.dropdownNav}`}
                  >
                    <span
                      className={`nav-link dropdown-toggle ${styles.navLink} ${styles.navLinkHover}`}
                      onClick={() => handleDropdownClick("dashboard")}
                      style={{ cursor: "pointer" }}
                    >
                      {language === "ar" ? "لوحة التحكم" : "Dashboard"}
                    </span>
                    <ul
                      className={`dropdown-menu ${styles.dashboardDropdown} ${dashboardDropdownOpen ? "show" : ""
                        }`}
                    >
                      {/* Same logic for admin/seller here */}
                    </ul>
                  </li>
                )}

              {isMobile && (
                <li
                  ref={languageDropdownRef}
                  className={`nav-item dropdown ${styles.bottomNavbarNavItem} ${styles.dropdownNav}`}
                >
                  <span
                    className={`nav-link dropdown-toggle ${styles.navLink} ${styles.navLinkHover}`}
                    onClick={() => handleDropdownClick("language")}
                    style={{ cursor: "pointer" }}
                  >
                    {language.toUpperCase()}
                  </span>
                  <ul
                    className={`dropdown-menu ${styles.langDropdown} ${languageDropdownOpen ? "show" : ""
                      }`}
                  >
                    <li>
                      <button
                        className={`dropdown-item ${styles.langDropdownItem}`}
                        onClick={handleLanguageChange}
                      >
                        {oppositeLang.toUpperCase()}
                      </button>
                    </li>
                  </ul>
                </li>
              )}

              <li className={`nav-item ${styles.bottomNavbarNavItem}`}>
                <Link
                  to="/contact"
                  className={`nav-link ${styles.navLink} ${styles.navLinkHover}`}
                >
                  {language === "ar" ? "تواصل معنا" : "Contact Us"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
