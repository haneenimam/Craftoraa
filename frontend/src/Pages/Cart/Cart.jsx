import React from "react";
import { useCart } from "../../Context/CartContext";
import { useLanguage } from "../../Context/LanguageContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const { cart, removeFromCart, calculateTotal, updateQuantity } = useCart();
  const { language } = useLanguage();
  const t = (en, ar) => (language === "ar" ? ar : en);
  const currencyLabel = language === "ar" ? "ج.م" : "EGP";

  const navigate = useNavigate();
  const location = useLocation();


  const lastShoppingPage = localStorage.getItem("lastShoppingPage") || "/product-list";

 
  const from = location.state?.from;
  const previousPage = !from || from === "/checkout" || from === "/cart" ? lastShoppingPage : from;

  const handleIncrease = (product) => {
    const stock = product.inStock ?? product.stock ?? product.quantity ?? Infinity;
    if (product.quantity < stock) {
      updateQuantity(product._id || product.id, product.quantity + 1);
    }
  };

  const handleDecrease = (product) => {
    if (product.quantity > 1) {
      updateQuantity(product._id || product.id, product.quantity - 1);
    }
  };

  return (
    <div className={styles.cartPage}>
      <h2 className={styles.title}>{t("Your Cart", "عربة التسوق")}</h2>

      {cart.length === 0 ? (
        <p className={styles.emptyMessage}>
          {t("Your cart is empty.", "عربة التسوق فارغة.")}
        </p>
      ) : (
        <div>
          <div className={styles.cartItems}>
            {cart.map((product) => {
              const productId = product._id || product.id;
              const imgSrc =
                product.image ||
                product.images?.[0] ||
                product.thumbnail ||
                "/default-product.jpg";
              const stock = product.inStock ?? product.stock ?? product.quantity ?? Infinity;

              return (
                <div key={productId} className={styles.cartItem}>
                  <div className={styles.itemDetails}>
                    <img
                      src={imgSrc}
                      alt={product.title}
                      className={styles.thumbnail}
                      onError={(e) => (e.target.src = "/default-product.jpg")}
                    />
                    <div
                      className={`${styles.itemText} ${
                        language === "ar" ? styles.itemTextArabic : ""
                      }`}
                    >
                      <p className={styles.productTitle}>{product.title}</p>

                      <p className={styles.productPrice}>
                        <span className={styles.priceContainer}>
                          {product.price}
                          <span className={styles.currency}>{currencyLabel}</span>
                        </span>{" "}
                        {t("x", "x")} {product.quantity}
                      </p>

                      <p className={styles.productTotalPrice}>
                        {t("Total:", "الإجمالي:")}{" "}
                        <span className={styles.priceContainer}>
                          {(product.price * product.quantity).toFixed(2)}
                          <span className={styles.currency}>{currencyLabel}</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className={styles.actionsGroup}>
                    <div className={styles.quantityControl}>
                      <button
                        onClick={() => handleDecrease(product)}
                        disabled={product.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{product.quantity}</span>
                      <button
                        onClick={() => handleIncrease(product)}
                        disabled={product.quantity >= stock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className={styles.removeButton}
                      onClick={() => removeFromCart(productId)}
                    >
                      {t("Remove", "إزالة")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.cartSummary}>
            <h4 className={styles.totalPrice}>
              {t("Total Price:", "السعر الإجمالي:")}{" "}
              <span className={styles.priceContainer}>
                {calculateTotal()}
                <span className={styles.totalCurrency}>{currencyLabel}</span>
              </span>
            </h4>
            <div className={styles.actions}>
              <button
                onClick={() => navigate(previousPage)}
                className={`${styles.continueShopping} ${styles.buttonReset}`}
              >
                {t("Continue Shopping", "متابعة التسوق")}
              </button>

              <Link to="/checkout" className={styles.checkoutButton}>
                {t("Checkout", "إتمام الشراء")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
