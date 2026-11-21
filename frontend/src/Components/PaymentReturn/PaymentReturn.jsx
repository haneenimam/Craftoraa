import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useLanguage } from "../../Context/LanguageContext";

// Handles the customer's return from Stripe Checkout on whichever page loads first.
// Stripe sends them back to the site root (`/?payment=success|cancelled`), which every
// static host can serve, so this doesn't depend on the host's SPA fallback.
// pendingOrder is removed straight away, so a refresh (or React StrictMode running the
// effect twice) can't save the same order twice.
const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (!payment) return;

    const pendingOrder = localStorage.getItem("pendingOrder");
    if (!pendingOrder) return; // already handled, or nothing was in progress
    localStorage.removeItem("pendingOrder");

    const t = (en, ar) => (language === "ar" ? ar : en);

    if (payment === "success") {
      localStorage.removeItem("backupCart");
      navigate("/", { replace: true });
      axios
        .post(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, JSON.parse(pendingOrder))
        .then(() => {
          alert(t("Payment successful! Your order has been placed.", "تم الدفع بنجاح! تم تنفيذ طلبك."));
        })
        .catch(() => {
          alert(t(
            "Payment received, but we couldn't save your order. Please contact us.",
            "تم الدفع، لكن تعذر حفظ طلبك. يرجى التواصل معنا."
          ));
        });
    } else if (payment === "cancelled") {
      // CartContext has already put the cart back from backupCart
      alert(t("Payment was cancelled. Your cart has been kept.", "تم إلغاء الدفع. تم الاحتفاظ بعربة التسوق."));
      navigate("/checkout", { replace: true });
    }
  }, [searchParams, navigate, language]);

  return null;
};

export default PaymentReturn;
