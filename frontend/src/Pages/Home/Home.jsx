import React from 'react';
import HeroSection from '../../Components/HeroSection/HeroSection';
import FeaturedProducts from '../../Components/FeaturedProducts/FeaturedProducts';
import NewArrivals from '../../Components/NewArrivals/NewArrivals';
import ShopByCategory from '../../Components/ShopByCategory/ShopByCategory';
import styles from './Home.module.css'; 

const Home = () => {
  return (
    <div className={styles.container}>
      <HeroSection />
      <NewArrivals />
      <ShopByCategory />
      <FeaturedProducts />
    </div>
  );
};

export default Home;
