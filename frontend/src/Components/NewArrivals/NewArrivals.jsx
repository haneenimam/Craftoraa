import React, { useEffect, useState } from "react";
import axiosInstance from "../../Apis/config";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import { useLanguage } from "../../Context/LanguageContext";
import styles from "./NewArrivals.module.css";
import { FiShoppingCart, FiCreditCard } from "react-icons/fi";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language } = useLanguage();

  useEffect(() => {
    axiosInstance
      .get("/api/products?limit=4&page=1")
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate("/checkout");
  };

  if (loading)
    return (
      <p className={styles.statusMessage}>
        {language === "ar"
          ? "جاري تحميل المنتجات الجديدة..."
          : "Loading new arrivals..."}
      </p>
    );
  if (error) return <p className={styles.statusMessage}>{error}</p>;

  return (
    <section className={styles.newArrivalsSection}>
      <h2
        className={`${styles.sectionTitle} ${
          language === "ar" ? styles.rtlTitle : ""
        }`}
      >
        {language === "ar" ? "المنتجات الجديدة" : "New Arrivals"}
      </h2>
      <div className={styles.newArrivalsProductsContainer}>
        {products.map((product) => {
          const id = product.id || product._id;
          const imgSrc =
            product.thumbnail ||
            product.image ||
            product.images?.[0] ||
            "/default-product.jpg";

          return (
            <div
              className={styles.newArrivalsProductWrapper}
              key={id}
              onClick={() => navigate(`/product/${id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${id}`)}
            >
              <div className={styles.newArrivalsProductCard}>
                <div className={styles.imageWrapper}>
                  <img
                    src={imgSrc}
                    alt={product.title || "Product"}
                    className={styles.newArrivalsImage}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/default-product.jpg";
                    }}
                  />
                  <div className={styles.hoverActions}>
                    <button
                      className={styles.iconButton}
                      onClick={(e) => handleAddToCart(product, e)}
                      aria-label={`${
                        language === "ar" ? "أضف إلى السلة" : "Add to cart"
                      }: ${product.title}`}
                      title={
                        language === "ar" ? "أضف إلى السلة" : "Add to Cart"
                      }
                    >
                      <FiShoppingCart />
                    </button>
                    <button
                      className={`${styles.iconButton} ${styles.buyNowButton}`}
                      onClick={(e) => handleBuyNow(product, e)}
                      aria-label={`${
                        language === "ar" ? "اشتري الآن" : "Buy now"
                      }: ${product.title}`}
                      title={language === "ar" ? "اشتري الآن" : "Buy Now"}
                    >
                      <FiCreditCard />
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.newArrivalsInfo}>
                <p className={styles.newArrivalsTitle}>{product.title}</p>
                <div className={styles.priceContainer}>
                  <p className={styles.newArrivalsPrice}>{product.price}</p>
                  <span className={styles.currency}>
                    {language === "ar" ? "ج.م" : "EGP"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(NewArrivals);
