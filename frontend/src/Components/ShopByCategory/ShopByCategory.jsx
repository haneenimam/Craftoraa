import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext";
import styles from "./ShopByCategory.module.css";

const categories = [
  { key: "jewelry", image: "jewelry.jpeg" },
  { key: "crochet", image: "crochet.jpeg" },
  { key: "candles", image: "candles.jpeg" },
  { key: "ceramic", image: "ceramic.jpeg" },
  { key: "home_essentials", image: "homeess.jpeg" },
];

const categoryNames = {
  en: {
    jewelry: "Jewelry",
    crochet: "Crochet",
    candles: "Candles",
    ceramic: "Ceramics",
    home_essentials: "Home Essentials",
  },
  ar: {
    jewelry: "إكسسوارات",
    crochet: "كروشيه",
    candles: "شموع",
    ceramic: "سيراميك",
    home_essentials: "الاحتياجات المنزلية",
  },
};

const categoryMap = {
  jewelry: "Jewelry",
  crochet: "Crochet",
  candles: "Candles",
  ceramic: "Ceramics",
  home_essentials: "Home Essential",
};

const ShopByCategory = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 414);
  const { language } = useLanguage();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 414);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShopNow = (categoryKey) => {
    const backendCategory = categoryMap[categoryKey] || categoryKey;
    navigate(
      `/category-products?category=${encodeURIComponent(backendCategory)}`
    );
  };

  const title = language === "ar" ? "تسوق حسب الفئة" : "Shop by Category";
  const shopNowText = language === "ar" ? "تسوق الآن" : "Shop Now";

  const renderCard = (category, idx, cardSizeClass) => {
    const translatedName =
      categoryNames[language]?.[category.key] || category.key;

    return (
      <div
        key={idx}
        className={`${styles["category-card"]} ${styles[cardSizeClass]}`}
        style={{ backgroundImage: `url(${category.image})` }}
        onClick={() => handleShopNow(category.key)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleShopNow(category.key);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className={styles.overlay}>
          <h3 className={styles["category-name"]}>{translatedName}</h3>
          <button
            className={styles["shop-button"]}
            onClick={(e) => {
              e.stopPropagation();
              handleShopNow(category.key);
            }}
          >
            {shopNowText}
          </button>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <section className={styles["shop-by-category"]}>
        <h2
          className={`${styles["section-title"]} ${
            language === "ar" ? styles["rtl-title"] : ""
          }`}
        >
          {title}
        </h2>
        <div className={styles["category-row"]}>
          {categories.map((category, idx) =>
            renderCard(category, idx, "mobile-card")
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={styles["shop-by-category"]}>
      <h2
        className={`${styles["section-title"]} ${
          language === "ar" ? styles["rtl-title"] : ""
        }`}
      >
        {title}
      </h2>

      <div className={`${styles["category-row"]} ${styles["large-row"]}`}>
        {categories
          .slice(0, 2)
          .map((category, idx) => renderCard(category, idx, "large-card"))}
      </div>

      <div className={`${styles["category-row"]} ${styles["small-row"]}`}>
        {categories
          .slice(2)
          .map((category, idx) => renderCard(category, idx + 2, "small-card"))}
      </div>
    </section>
  );
};

export default ShopByCategory;
