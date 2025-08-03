import React from 'react';
import styles from './Footer.module.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useLanguage } from '../../Context/LanguageContext';

const Footer = () => {
  const { language } = useLanguage();

  const contactUsText = language === 'ar' ? 'تواصل معنا' : 'Contact Us';
  const copyright =
    language === 'ar'
      ? '© 2025 كرافتورا. جميع الحقوق محفوظة.'
      : '© 2025 Craftora. All rights reserved.';

  return (
    <footer className={`${styles['custom-footer']} footer py-3`}>
      <div className="container d-flex align-items-center justify-content-center position-relative flex-wrap">
      
        <img
          src="/logo.jpg"
          alt="Local Market Logo"
          className={styles.logoImage}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />

       
        <div className="text-center w-100">
          <p>{copyright}</p>

          <div className={styles['contact-row']}>
            <span className={styles['contact-label']}>{contactUsText}</span>
            <div className={styles['contact-icons']}>
              <FaEnvelope title="Email" />
              <FaPhone title="Phone" />
              <FaMapMarkerAlt title="Location" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
