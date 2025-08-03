import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';
import { useLanguage } from '../../Context/LanguageContext';

const NotFound = () => {
  const { language } = useLanguage();
  const t = (en, ar) => (language === 'ar' ? ar : en);

  return (
    <div className={styles.container}>
      <img
        src="/PageNotFound.jpg"
        alt={t("Page Not Found", "الصفحة غير موجودة")}
        className={styles.image}
        onError={(e) => {
          e.target.src = '/default404.png'; 
        }}
      />
      <Link to="/" className={styles.backButton}>
        {t("Back to Home", "العودة إلى الصفحة الرئيسية")}
      </Link>
    </div>
  );
};

export default NotFound;
