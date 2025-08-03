import React, { useEffect, useState } from "react";
import axiosInstance from "../../Apis/config";
import ProductCard from "../../Components/ProductCard/ProductCard";
import styles from "./ProductList.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import ReactSlider from "react-slider";
import { useLanguage } from "../../Context/LanguageContext";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const params = new URLSearchParams(location.search);
  const initialCategory = params.get("category") || "";
  const initialSearch = params.get("search") || "";
  const initialMinPrice = parseInt(params.get("minPrice")) || 0;
  const initialMaxPrice = parseInt(params.get("maxPrice")) || 2000;

  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);
  const [tempPriceRange, setTempPriceRange] = useState([initialMinPrice, initialMaxPrice]);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const categories = isArabic
    ? ["كل المنتجات", "إكسسوارات", "شموع", "كروشيه", "سيراميك", "الاحتياجات المنزلية"]
    : ["All Products", "Jewelry", "Candles", "Crochet", "Ceramics", "Home Essential"];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 800);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = {
      page,
      ...(category && category !== (isArabic ? "كل المنتجات" : "All Products") && { category }),
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      ...(debouncedSearch && { search: debouncedSearch }),
    };

    axiosInstance
      .get("/api/products", { params })
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data.data && Array.isArray(data.data.products)) {
          setProducts(data.data.products);
        } else {
          throw new Error("Unexpected API response structure");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(isArabic ? "حدث خطأ أثناء تحميل المنتجات" : "Error fetching products");
        setLoading(false);
        console.error("Error fetching products:", err);
      });
  }, [page, category, priceRange, debouncedSearch, isArabic]);

  useEffect(() => {
    setPage(1);
  }, [category, priceRange, debouncedSearch]);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (category) queryParams.set("category", category);
    if (search) queryParams.set("search", search);
    if (priceRange[0] !== 0 || priceRange[1] !== 2000) {
      queryParams.set("minPrice", priceRange[0]);
      queryParams.set("maxPrice", priceRange[1]);
    }

    const queryString = queryParams.toString();
    const fullURL = `/product-list${queryString ? "?" + queryString : ""}`;
    localStorage.setItem("lastShoppingPage", fullURL);
  }, [category, search, priceRange]);

  if (loading) {
    return <div className={styles.loading}>{isArabic ? "جارٍ تحميل المنتجات..." : "Loading products..."}</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container} dir={isArabic ? "rtl" : "ltr"}>
      <div className={styles.filters}>
        <input
          type="text"
          placeholder={isArabic ? "ابحث باسم المنتج" : "Search by name"}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.filterInput}
        />

        <div className={styles.dropdownWrapper}>
          <div
            className={styles.customDropdown}
            onClick={() => setOpen(!open)}
            tabIndex={0}
            onBlur={() => setOpen(false)}
          >
            <span>{category || (isArabic ? "كل المنتجات" : "All Products")}</span>
            <ul className={`${styles.dropdownMenu} ${open ? styles.show : ""}`}>
              {categories.map((option) => (
                <li
                  key={option}
                  className={`${styles.dropdownOption} ${category === option ? styles.active : ""}`}
                  onClick={() => {
                    setCategory(option);
                    setOpen(false);
                  }}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.sliderWrapper}>
          <label className={styles.sliderLabel}>
            {isArabic
              ? `السعر: ج.م${tempPriceRange[0]} – ج.م${tempPriceRange[1]}`
              : `Price Range: EGP${tempPriceRange[0]} – EGP${tempPriceRange[1]}`}
          </label>
          <ReactSlider
            className={styles.dualSlider}
            thumbClassName={styles.thumb}
            trackClassName={styles.track}
            min={0}
            max={3000}
            step={50}
            value={tempPriceRange}
            onChange={setTempPriceRange}
            onAfterChange={setPriceRange}
            minDistance={50}
            pearling
            withTracks
          />
        </div>
      </div>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} page={page} />
        ))}
      </div>

      <div className={styles.pagination}>
        <button
          className={styles.pageButton}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          {isArabic ? "السابق" : "Previous"}
        </button>
        <span className={styles.pageNumber}>
          {isArabic ? `الصفحة ${page}` : `Page ${page}`}
        </span>
        <button
          className={styles.pageButton}
          onClick={() => setPage((prev) => prev + 1)}
          disabled={products.length < 20}
        >
          {isArabic ? "التالي" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default ProductList;
