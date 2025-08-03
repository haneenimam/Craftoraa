import React from 'react';
import styles from './HeroSection.module.css';
import { useLanguage } from '../../Context/LanguageContext';

const HeroSection = () => {
  const { language } = useLanguage();
  const t = (en, ar) => (language === 'ar' ? ar : en);

  return (
    <div className={styles['hero-container']}>
      <div id="carouselExample" className={`carousel slide ${styles.carousel}`} data-bs-ride="carousel">
        <div className={`carousel-inner ${styles['carousel-inner']}`}>
          <div className="carousel-item active">
            <img src="h1.jpg" className="d-block w-100" alt="First slide" />
          </div>
          <div className="carousel-item">
            <img src="h2.jpg" className="d-block w-100" alt="Second slide" />
          </div>
          <div className="carousel-item">
            <img src="h3.jpg" className="d-block w-100" alt="Third slide" />
          </div>
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">{t("Previous", "السابق")}</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">{t("Next", "التالي")}</span>
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
