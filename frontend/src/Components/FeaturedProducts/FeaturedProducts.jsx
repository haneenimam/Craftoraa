import React, { useEffect, useState } from "react";
import axiosInstance from "../../Apis/config";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiCreditCard } from "react-icons/fi";
import { useCart } from "../../Context/CartContext";
import { useLanguage } from "../../Context/LanguageContext";
import styles from "./FeaturedProducts.module.css";

const FeaturedProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language } = useLanguage();

  useEffect(() => {
    axiosInstance
      .get("/api/products?limit=9&page=1")
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data.data && Array.isArray(data.data.products)) {
          setProducts(data.data.products);
        } else {
          throw new Error("Unexpected API response structure");
        }
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setError(
          language === "ar"
            ? "حدث خطأ أثناء جلب المنتجات"
            : "Error fetching products"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [language]);

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleBuyNow = (product, e) => {
    e.stopPropagation();
    addToCart(product);
    navigate("/checkout");
    window.scrollTo(0, 0);
  };

  const sectionTitle = language === "ar" ? "منتجات مميزة" : "Featured Products";
  const addToCartText = language === "ar" ? "أضف إلى السلة" : "Add to Cart";
  const buyNowText = language === "ar" ? "اشتري الآن" : "Buy Now";
  const loadingText =
    language === "ar"
      ? "جاري تحميل المنتجات المميزة..."
      : "Loading featured products...";
  const currencySymbol = language === "ar" ? "ج.م" : "EGP";

  if (loading) return <p className={styles.statusMessage}>{loadingText}</p>;
  if (error) return <p className={styles.statusMessage}>{error}</p>;

  return (
    <div className={styles["featured-product-sidebar"]}>
      <h2
        className={`${styles["section-title"]} ${
          language === "ar" ? styles["rtl-title"] : ""
        }`}
      >
        {sectionTitle}
      </h2>

      <div className={styles["product-list"]}>
        {products.map((product) => {
          const id = product.id || product._id;
          const titleFirstWord =
            product.title?.split(" ")[0] ||
            (language === "ar" ? "منتج" : "Product");
          const imgSrc =
            product.image ||
            product.images?.[0] ||
            product.thumbnail ||
            "/default-product.jpg";

          return (
            <div
              key={id}
              className={styles["product-card"]}
              onClick={() => navigate(`/product/${id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${id}`)}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={imgSrc}
                  alt={product.title || "Product"}
                  className={styles["product-image"]}
                  width="240"
                  height="160"
                  onError={(e) => (e.target.src = "/default-product.jpg")}
                />
                <div className={styles.hoverActions}>
                  <button
                    className={styles.iconButton}
                    onClick={(e) => handleAddToCart(product, e)}
                    aria-label={`${addToCartText}: ${product.title}`}
                    title={addToCartText}
                  >
                    <FiShoppingCart />
                  </button>
                  <button
                    className={styles.iconButton}
                    onClick={(e) => handleBuyNow(product, e)}
                    aria-label={`${buyNowText}: ${product.title}`}
                    title={buyNowText}
                  >
                    <FiCreditCard />
                  </button>
                </div>
              </div>
              <p className={styles["product-title"]}>{titleFirstWord}</p>
              <div className={styles.priceContainer}>
                <p className={styles["product-price"]}>
                  {language === "ar" ? (
                    <>
                      <span className={styles.currency}>{currencySymbol}</span>{" "}
                      {product.price}
                    </>
                  ) : (
                    <>
                      {product.price}{" "}
                      <span className={styles.currency}>{currencySymbol}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(FeaturedProduct);
