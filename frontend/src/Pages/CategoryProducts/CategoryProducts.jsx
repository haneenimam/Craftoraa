import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../Apis/config';
import ProductCard from '../../Components/ProductCard/ProductCard';
import styles from '../ProductList/ProductList.module.css';

const CategoryProducts = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await axiosInstance.get(`/api/products?category=${encodeURIComponent(category)}`);
        setProducts(response.data.products || []);
      } catch (error) {
        setError('Failed to fetch products');
        console.error('Error fetching category products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      setLoading(true);
      setError(null);
      fetchCategoryProducts();
    }
  }, [category]);

  if (loading) return <div className={styles.loading}>Loading products...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>

      <div className={styles.grid}>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))
        ) : (
          <p className={styles.noProducts}>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
