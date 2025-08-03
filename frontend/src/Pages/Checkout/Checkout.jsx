import React, { useState } from "react";
import { useCart } from "../../Context/CartContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../Context/LanguageContext";
import styles from "./Checkout.module.css";
import axios from "axios";

const egyptGovernorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Monufia",
  "Minya",
  "Qaliubiya",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharkia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
];

const Checkout = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { language } = useLanguage();
  const currency = language === "ar" ? "ج.م" : "EGP";
  const t = (en, ar) => (language === "ar" ? ar : en);

  const increaseQuantity = (productId) => {
    const item = cart.find((item) => (item._id || item.id) === productId);
    if (!item) return;
    const stock = item.inStock ?? item.instock ?? item.stock ?? Infinity;
    if ((item.quantity || 1) < stock) {
      updateQuantity(productId, (item.quantity || 1) + 1);
    }
  };

  const decreaseQuantity = (productId) => {
    const item = cart.find((item) => (item._id || item.id) === productId);
    if (!item) return;
    if ((item.quantity || 1) > 1) {
      updateQuantity(productId, (item.quantity || 1) - 1);
    }
  };

  const [form, setForm] = useState({
    email: "",
    country: "Egypt",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    governorate: "",
    postalCode: "",
    phone: "",
    paymentMethod: "Cash on Delivery",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState({});

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const validateField = (name, value) => {

    switch (name) {
      case "email":
        if (!value) return t("Email is required", "البريد الإلكتروني مطلوب");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return t("Invalid email address", "البريد الإلكتروني غير صالح");
        return "";

      case "firstName":
        if (!value.trim())
          return t("First name is required", "الاسم الأول مطلوب");
        if (value.trim().length < 2)
          return t(
            "First name must be at least 2 characters",
            "الاسم الأول يجب أن لا يقل عن حرفين"
          );
        return "";

      case "lastName":
        if (!value.trim())
          return t("Last name is required", "اسم العائلة مطلوب");
        if (value.trim().length < 2)
          return t(
            "Last name must be at least 2 characters",
            "اسم العائلة يجب أن لا يقل عن حرفين"
          );
        return "";

      case "address":
        if (!value.trim()) return t("Address is required", "العنوان مطلوب");
        if (value.trim().length < 10)
          return t(
            "Address must be at least 10 characters",
            "العنوان يجب أن يكون 10 أحرف على الأقل"
          );
        return "";

      case "city":
        if (!value.trim()) return t("City is required", "المدينة مطلوبة");
        if (value.trim().length < 3)
          return t(
            "City must be at least 3 characters",
            "يجب ألا يقل اسم المدينة عن 3 أحرف"
          );
        return "";

      case "governorate":
        if (!value) return t("Governorate is required", "المحافظة مطلوبة");
        return "";
        case "postalCode":
          if (value.trim() && !/^[0-9٠-٩]{4,5}$/.test(value))
            return t(
              "Postal code must be 4 or 5 digits",
              "الرمز البريدي يجب أن يكون ٤ أو ٥ أرقام"

            );
          return "";
        
        case "phone":
          if (!value.trim())
            return t("Phone number is required", "رقم الهاتف مطلوب");
          if (!/^(010|011|012|015|٠١٠|٠١١|٠١٢|٠١٥)[0-9٠-٩]{8}$/.test(value))
            return t(
              "Phone must start with 010, 011, 012, or 015 and be 11 digits long",
              "رقم الهاتف يجب أن يبدأ بـ ٠١٠ أو ٠١١ أو ٠١٢ أو ٠١٥ ويكون ١١ رقمًا"

            );
          return "";
        

      case "country":
        if (!value.trim()) return t("Country is required", "الدولة مطلوبة");
        if (value.trim().toLowerCase() !== "egypt")
          return t(
            "Currently, we only ship to Egypt",
            "حالياً، نشحن فقط داخل مصر"
          );
        return "";

      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert(
        t(
          "Please fix the errors in the form before submitting.",
          "يرجى تصحيح الأخطاء في النموذج قبل الإرسال."
        )
      );
      return;
    }

    const orderData = {
      shippingInfo: {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        apartment: form.apartment,
        city: form.city,
        governorate: form.governorate,
        postalCode: form.postalCode,
        phone: form.phone,
        country: form.country,
      },
      paymentMethod: form.paymentMethod,
      totalPrice,
      items: cart.map((item) => ({
        product: item._id || item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      status: "pending",
    };

    try {
      setLoading(true);
    
      if (form.paymentMethod === "Cash on Delivery") {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/orders`,
          orderData
        );
        
        clearCart(); // ✅ Clear cart immediately for COD
        alert(t("Order placed successfully!", "تم تنفيذ الطلب بنجاح!"));
        navigate("/");
      } else if (form.paymentMethod === "Card") {
        const payload = {
          items: cart.map((item) => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          email: form.email,
          totalPrice: parseFloat(totalPrice.toFixed(2)),
        };
    
        console.log("Sending card payment payload:", payload);
    
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/payment/create-checkout-session`,
          payload
        );
    
        if (response.data?.url) {
          // ✅ Backup the cart in case user returns without completing payment
          localStorage.setItem("backupCart", JSON.stringify(cart));
    
          // ✅ Temporarily clear the cart before redirecting to Stripe
          clearCart();
    
          // ✅ Redirect to Stripe payment page
          window.location.href = response.data.url;
        } else {
          throw new Error("Stripe session URL not received.");
        }
      }
    } catch (error) {
      console.error(
        "Order submission failed:",
        error?.response?.data || error.message
      );
      alert(
        t(
          "Failed to place order. Please try again.",
          "فشل تنفيذ الطلب. حاول مرة أخرى من فضلك."
        )
      );
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className={styles.checkoutContainer}>
      <form onSubmit={handleSubmit} className={styles.checkoutForm} noValidate>
        <h2 className={styles.sectionTitle}>
          {t("Contact", "معلومات الاتصال")}
        </h2>

        <div className={styles.formGroup}>
          <label>{t("Email:", "البريد الإلكتروني:")}</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t("Enter your email", "أدخل بريدك الإلكتروني")}
            className={errors.email ? styles.inputError : ""}
          />
          {errors.email && (
            <span className={styles.errorMsg}>{errors.email}</span>
          )}
        </div>

        <h2 className={styles.sectionTitle}>
          {t("Delivery", "معلومات التوصيل")}
        </h2>

        <div className={styles.formGroup}>
          <label>{t("Country/Region:", "الدولة / المنطقة:")}</label>
          <input type="text" name="country" value="Egypt" readOnly />
        </div>

        <div className={styles.formGroup}>
          <label>{t("First Name:", "الاسم الأول:")}</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder={t("Enter your first name", "أدخل الاسم الأول")}
            className={errors.firstName ? styles.inputError : ""}
          />
          {errors.firstName && (
            <span className={styles.errorMsg}>{errors.firstName}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>{t("Last Name:", "اسم العائلة:")}</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder={t("Enter your last name", "أدخل اسم العائلة")}
            className={errors.lastName ? styles.inputError : ""}
          />
          {errors.lastName && (
            <span className={styles.errorMsg}>{errors.lastName}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>{t("Address:", "العنوان:")}</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder={t(
              "Street name, building number, etc.",
              "اسم الشارع، رقم المبنى، ..."
            )}
            className={errors.address ? styles.inputError : ""}
          />
          {errors.address && (
            <span className={styles.errorMsg}>{errors.address}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>{t("Apartment (optional):", "الشقة (اختياري):")}</label>
          <input
            type="text"
            name="apartment"
            value={form.apartment}
            onChange={handleChange}
            placeholder={t("Apartment, floor, etc.", "الشقة، الدور، ...")}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t("City:", "المدينة:")}</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className={errors.city ? styles.inputError : ""}
            placeholder={t("Enter your city", "أدخل المدينة")}
          />
          {errors.city && (
            <span className={styles.errorMsg}>{errors.city}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>{t("Governorate:", "المحافظة:")}</label>
          <select
            name="governorate"
            value={form.governorate}
            onChange={handleChange}
            className={`${styles.selectInput} ${errors.governorate ? styles.inputError : ""
              }`}
            aria-label={t("Select your governorate", "اختر المحافظة")}
          >
            <option value="">{t("Select Governorate", "اختر المحافظة")}</option>
            {egyptGovernorates.map((gov, idx) => (
              <option key={idx} value={gov}>
                {gov}
              </option>
            ))}
          </select>
          {errors.governorate && (
            <span className={styles.errorMsg}>{errors.governorate}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>
            {t("Postal Code (optional):", "الرمز البريدي (اختياري):")}
          </label>
          <input
            type="text"
            name="postalCode"
            value={form.postalCode}
            onChange={handleChange}
            className={errors.postalCode ? styles.inputError : ""}
            placeholder={t("Enter postal code", "أدخل الرمز البريدي")}
          />
          {errors.postalCode && (
            <span className={styles.errorMsg}>{errors.postalCode}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label>{t("Phone:", "رقم الهاتف:")}</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={errors.phone ? styles.inputError : ""}
            placeholder={t("Enter your phone number", "أدخل رقم الهاتف")}
          />
          {errors.phone && (
            <span className={styles.errorMsg}>{errors.phone}</span>
          )}
        </div>

        <h2 className={styles.sectionTitle}>{t("Payment", "الدفع")}</h2>

        <div className={styles.formGroup}>
          <label>{t("Payment Method:", "طريقة الدفع:")}</label>
          <select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            className={styles.selectInput}
          >
            <option value="Cash on Delivery">
              {t("Cash on Delivery", "الدفع عند الاستلام")}
            </option>
            <option value="Card">{t("Card", "بطاقة")}</option>
          </select>
        </div>

        <h2 className={styles.sectionTitle}>
          {t("Order Summary", "ملخص الطلب")}
        </h2>

        <ul className={styles.orderSummary}>
          {cart.map((item) => {
            const productId = item._id || item.id;
            const stock =
              item.inStock ?? item.instock ?? item.stock ?? Infinity;
            const imageSrc = Array.isArray(item.images)
              ? item.images[0]
              : item.images || item.thumbnail;

            return (
              <li key={productId} className={styles.summaryItem}>
                <div className={styles.itemDetails}>
                  <img src={imageSrc} alt={item.title} />

                  <div className={styles.infoWrapper}>
                    <div className={styles.titleAndPrice}>
                      <span className={styles.productTitle}>{item.title}</span>
                      <span className={styles.productPrice}>
                        <span className={styles.priceContainer}>
                          {item.price.toFixed(2)}{" "}
                          <span className={styles.currency}>{currency}</span>
                        </span>
                      </span>
                    </div>

                    <span className={styles.quantityNumber}>
                      {t("Qty:", "الكمية:")} {item.quantity}
                    </span>

                    <span className={styles.productTotalPrice}>
                      {(item.price * item.quantity).toFixed(2)}{" "}
                      <span className={styles.currency}>{currency}</span>
                    </span>

                    <div className={styles.qtyControls}>
                      <button
                        type="button"
                        onClick={() =>
                          item.quantity === 1
                            ? removeFromCart(productId)
                            : decreaseQuantity(productId)
                        }
                        className={styles.qtyButton}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(productId)}
                        className={styles.qtyButton}
                        disabled={item.quantity >= stock}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}

          <li className={styles.total}>
            <strong>{t("Total", "الإجمالي")}</strong>{" "}
            <strong>
              <span className={styles.priceContainer}>
                {totalPrice.toFixed(2)}
                <span className={styles.currency}>{currency}</span>
              </span>
            </strong>
          </li>
        </ul>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={
            loading || Object.values(errors).some((e) => e) || cart.length === 0
          }
        >
          {loading
            ? t("Processing...", "جاري المعالجة...")
            : t("Place Order", "إتمام الطلب")}
        </button>
      </form>
    </div>
  );
};

export default Checkout;