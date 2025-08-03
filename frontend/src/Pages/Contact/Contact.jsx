import React, { useState, useEffect, useRef } from 'react';
import styles from './Contact.module.css';
import { useLanguage } from '../../Context/LanguageContext';

const Contact = () => {
  const { language } = useLanguage();

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  const validate = (data) => {
    const newErrors = {};

    if (data.name.trim() !== '' && !/^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,}$/.test(data.name.trim())) {
      newErrors.name = language === 'ar'
        ? 'يجب أن يحتوي الاسم على حرفين على الأقل ويتكون من حروف ومسافات فقط.'
        : 'Name must be at least 2 letters and contain only letters and spaces.';
    }

    if (data.email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = language === 'ar'
        ? 'يرجى إدخال بريد إلكتروني صالح.'
        : 'Please enter a valid email address.';
    }

    const trimmedMessage = data.message.trim();
    if (trimmedMessage !== '') {
      if (trimmedMessage.length < 10) {
        newErrors.message = language === 'ar'
          ? 'يجب أن تحتوي الرسالة على 10 أحرف على الأقل.'
          : 'Message must be at least 10 characters.';
      } else if (trimmedMessage.length > 200) {
        newErrors.message = language === 'ar'
          ? `الرسالة طويلة جدًا (${trimmedMessage.length}) حرف. الحد الأقصى هو 200.`
          : `Message is too long (${trimmedMessage.length} characters). Maximum is 200.`;
      }
    }

    return newErrors;
  };

  useEffect(() => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setIsFormValid(
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.message.trim() !== '' &&
      Object.keys(validationErrors).length === 0
    );
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    const validationErrors = validate(updatedFormData);
    setErrors(validationErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (
      Object.keys(validationErrors).length === 0 &&
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.message.trim() !== ''
    ) {
      alert(language === 'ar' ? 'تم إرسال الرسالة بنجاح!' : 'Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
      setIsFormValid(false);
    } else {
      if (validationErrors.name) {
        nameRef.current?.focus();
      } else if (validationErrors.email) {
        emailRef.current?.focus();
      } else if (validationErrors.message) {
        messageRef.current?.focus();
      }
    }
  };

  return (
    <div className={styles.contactContainer}>
      <h2 className={styles.contactTitle}>
        {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
      </h2>
      <form onSubmit={handleSubmit} className={styles.contactForm} noValidate>
        <div>
          <input
            type="text"
            name="name"
            placeholder={language === 'ar' ? 'اسمك' : 'Your Name'}
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? styles.errorInput : ''}
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby="name-error"
            ref={nameRef}
            maxLength={50}
          />
          {errors.name && (
            <p id="name-error" className={styles.errorText} role="alert">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder={language === 'ar' ? 'بريدك الإلكتروني' : 'Your Email'}
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? styles.errorInput : ''}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby="email-error"
            ref={emailRef}
            maxLength={100}
          />
          {errors.email && (
            <p id="email-error" className={styles.errorText} role="alert">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <textarea
            name="message"
            placeholder={language === 'ar' ? 'رسالتك' : 'Your Message'}
            rows="5"
            value={formData.message}
            onChange={handleChange}
            className={errors.message ? styles.errorInput : ''}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby="message-error"
            ref={messageRef}
            maxLength={200}
          />
          {errors.message && (
            <p id="message-error" className={styles.errorText} role="alert">
              {errors.message}
            </p>
          )}
          <p
            className={styles.charCount}
            style={{
              color:
                formData.message.length < 10 && formData.message.length > 0
                  ? 'red'
                  : '#093866',
            }}
          >
            {language === 'ar'
              ? `${formData.message.length} / 200 حرف`
              : `${formData.message.length} / 200 characters`}
          </p>
        </div>
        <button type="submit" disabled={!isFormValid}>
          {language === 'ar' ? 'إرسال' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Contact;
