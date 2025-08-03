import React from "react";
import { useCart } from "../../Context/CartContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product, page }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language } = useLanguage();

  const isArabic = language === "ar";

  const productId = product._id || product.id;
  const inStock = product.instock ?? product.stock ?? product.quantity ?? 0;


  let stockStatus = "";
  let stockColor = "";

  if (inStock === 0) {
    stockStatus = isArabic ? "غير متوفر" : "Out of Stock";
    stockColor = "#dc3545"; 
  } else if (inStock > 0 && inStock <= 5) {
    stockStatus = isArabic ? `كمية محدودة (${inStock})` : `Low Stock (${inStock})`;
    stockColor = "#ffc107"; 
  }

  const titleFirstWord = product.title?.split(" ")[0] || (isArabic ? "منتج" : "Product");
  const imgSrc =
    product.image || product.images?.[0] || product.thumbnail || "/default-product.jpg";

  const handleNavigate = () => {
    navigate(`/product/${productId}?page=${page}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (inStock === 0) return;
    addToCart(product);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (inStock === 0) return;
    addToCart(product);
    navigate("/checkout");
  };

  return (
    <div
      className={styles.card}
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
    >
      <img
        src={imgSrc}
        alt={product.title || "Product"}
        className={styles.image}
        onError={(e) => (e.target.src = "/default-product.jpg")}
      />

      <div className={styles.details}>
        <h3 className={styles.title}>{titleFirstWord}</h3>

        <div className={styles.priceContainer}>
          {isArabic ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <p className={styles.price}>ج.م {product.price}</p>
              <p className={styles.stockStatus} style={{ color: stockColor, margin: 0 }}>
                {stockStatus}
              </p>
            </div>
          ) : (
            <>
              <p className={styles.price}>{product.price}</p>
              <span className={styles.currency}>EGP</span>
              <p className={styles.stockStatus} style={{ color: stockColor }}>
                {stockStatus || "\u00A0"}
              </p>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cartButton}
            onClick={handleAddToCart}
            disabled={inStock === 0}
          >
            {isArabic ? "أضف إلى السلة" : "Add to Cart"}
          </button>

          <button
            className={styles.buyButton}
            onClick={handleBuyNow}
            disabled={inStock === 0}
          >
            {isArabic ? "اشتري الآن" : "Buy It Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
