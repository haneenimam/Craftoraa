import React from "react";
import { Link } from "react-router-dom";
import styles from "./Unauthorized.module.css"; 

const Unauthorized = ({ language = "en" }) => {
  return (
    <div className={`${styles.unauthorizedContainer} d-flex flex-column justify-content-center align-items-center text-center`}>
      <h1 className={styles.title}>
        {language === "ar" ? "غير مصرح لك بالدخول" : "Access Denied"}
      </h1>
      <p className={styles.message}>
        {language === "ar"
          ? "عذرًا، لا تملك الصلاحية للدخول إلى هذه الصفحة."
          : "Sorry, you don't have permission to access this page."}
      </p>
      <Link to="/" className={`${styles.homeLink} btn`}>
        {language === "ar" ? "العودة للرئيسية" : "Back to Home"}
      </Link>
    </div>
  );
};

export default Unauthorized;
