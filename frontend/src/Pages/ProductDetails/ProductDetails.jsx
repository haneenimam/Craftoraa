import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../Apis/config";
import { useCart } from "../../Context/CartContext";
import { useLanguage } from "../../Context/LanguageContext"; 
import styles from "./ProductDetails.module.css";

const ProductDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language } = useLanguage();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const page = new URLSearchParams(location.search).get("page") || 1;

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/api/products/${id}`)
      .then((res) => {
        const data = res.data;
        setProduct(data.product || data);
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        setError(
          language === "ar"
            ? "فشل في تحميل تفاصيل المنتج."
            : "Failed to load product details."
        );
      })
      .finally(() => setLoading(false));
  }, [id, language]);

  const handleBuy = () => {
    const stock = product.inStock ?? product.stock ?? product.quantity ?? Infinity;
    if (stock > 0) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      window.location.href = "/checkout";
    }
  };

  const handleContinueShopping = () => {
    navigate(-1);
  };

  const handleIncrease = () => {
    const stock = product.inStock ?? product.stock ?? product.quantity ?? Infinity;
    if (quantity < stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  if (loading) return <div className={styles.loading}>{language === "ar" ? "جارٍ التحميل..." : "Loading..."}</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!product) return <div className={styles.error}>{language === "ar" ? "المنتج غير موجود." : "Product not found."}</div>;

  const stock = product.inStock ?? product.stock ?? product.quantity ?? 0;

  return (
    <div
      className={`${styles["product-details"]} container py-4`}
      style={language === "ar" ? { direction: "ltr" } : {}}
    >
      <div className={`${styles["product-details-flex"]} row`}>
        <div className={`${styles["product-image"]} col-md-6`}>
          <img
            src={
              product.image ||
              product.thumbnail ||
              product.img ||
              product.images?.[0] ||
              "https://via.placeholder.com/400"
            }
            alt={product.title || "Product"}
            className="img-fluid"
            onError={(e) => (e.target.src = "https://via.placeholder.com/400")}
          />
        </div>

        <div className={`${styles["product-info"]} col-md-6`}>
          <h2 className={styles["product-title"]}>
            {product.name || (language === "ar" ? "منتج بدون اسم" : "Unnamed Product")}
          </h2>

          <div className={styles.priceContainer}>
            <span className={styles.productPrice}>
              {product.price != null ? product.price : "N/A"}
            </span>
            <span className={styles.currency}>EGP</span>
          </div>

          {stock <= 5 && stock > 0 && (
            <p className={`${styles["product-stock-status"]} ${styles["low-stock"]}`}>
              {language === "ar"
                ? `بسرعة! تبقى فقط ${stock} ${stock === 1 ? "قطعة" : "قطع"} في المخزون.`
                : `Hurry! Only ${stock} item${stock > 1 ? "s" : ""} left in stock.`}
            </p>
          )}
          {stock === 0 && (
            <p className={`${styles["product-stock-status"]} ${styles["out-of-stock"]}`}>
              {language === "ar" ? "غير متوفر في المخزون" : "Out of Stock"}
            </p>
          )}

          <p className={styles["product-description"]}>
            {product.description || (language === "ar" ? "لا يوجد وصف." : "No description available.")}
          </p>

          {stock > 0 && (
            <div className={styles["action-row"]}>
              <button className={styles["btn-buy-now"]} onClick={handleBuy}>
                {language === "ar" ? "اشترِ الآن" : "Buy Now"}
              </button>

              <div className={styles["quantity-counter"]}>
                <button onClick={handleDecrease} disabled={quantity <= 1}>
                  -
                </button>
                <span>{quantity}</span>
                <button onClick={handleIncrease} disabled={quantity >= stock}>
                  +
                </button>
              </div>

              <button
                className={styles["btn-continue-shopping"]}
                onClick={handleContinueShopping}
              >
                {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
