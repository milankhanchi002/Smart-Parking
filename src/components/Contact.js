import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import './Contact.css'; // Make sure you create this file

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus('submitting');

    try {
      // You would create a new API endpoint in your server.js to handle this form data.
      // For now, this is a placeholder URL.
      const response = await fetch('http://localhost:5001/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (response.ok) {
        setSubmissionStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setSubmissionStatus('error');
        const errorData = await response.json();
        console.error('Submission error:', errorData);
      }
    } catch (error) {
      setSubmissionStatus('error');
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="contact-page">
      <header className="navbar">
        <h1 className="navbar-logo">QuickPark</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
         
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>
      <section className="contact-section">
        <h2>Contact Us</h2>
        <p>We'd love to hear from you! Please fill out the form below.</p>
        <div className="contact-container">
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn-primary">Submit Message</button>

            {submissionStatus === 'submitting' && <p className="form-message submitting">Submitting...</p>}
            {submissionStatus === 'success' && <p className="form-message success">Thank you for your message! We will get back to you soon.</p>}
            {submissionStatus === 'error' && <p className="form-message error">Oops! Something went wrong. Please try again later.</p>}
          </form>
          <div className="contact-info">
            <h3>Our Chandigarh Office</h3>
            <p><FaMapMarkerAlt className="icon" /> Sector 17, Chandigarh, Punjab, India</p>
            <p><FaEnvelope className="icon" /> support@quickpark.com</p>
            <p><FaPhone className="icon" /> +91-9876543210</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;