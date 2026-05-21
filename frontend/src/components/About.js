import React from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaMapMarkedAlt, FaMobileAlt } from 'react-icons/fa';
import './About.css'; // Make sure you create this CSS file

function About() {
  return (
    <div className="about-page">
      <header className="navbar">
        <h1 className="navbar-logo">QuickPark</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
         
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </header>
      
      <section className="about-hero">
        <div className="hero-content">
          <h1>Solving the Parking Problem, One Spot at a Time</h1>
          <p>Discover how QuickPark is revolutionizing urban parking with technology and innovation.</p>
        </div>
      </section>

      <section className="about-mission">
        <div className="container">
          <h2>Our Mission</h2>
          <p>At QuickPark, our mission is to provide a seamless and stress-free parking experience for every driver. We believe that finding a parking spot should be easy, fast, and transparent. By leveraging real-time data and smart technology, we help you save time, reduce fuel consumption, and contribute to a greener city.</p>
        </div>
      </section>

      <section className="about-features">
        <div className="container">
          <h2>Why Choose QuickPark?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaCar className="feature-icon" />
              <h3>Effortless Booking</h3>
              <p>Reserve your spot in advance with just a few taps. No more circling the block in search of parking.</p>
            </div>
            <div className="feature-card">
              <FaMapMarkedAlt className="feature-icon" />
              <h3>Real-Time Availability</h3>
              <p>Our platform provides live updates on slot availability, so you always know what's open before you arrive.</p>
            </div>
            <div className="feature-card">
              <FaMobileAlt className="feature-icon" />
              <h3>User-Friendly App</h3>
              <p>The QuickPark app is designed to be intuitive and easy to use, putting all the information you need right at your fingertips.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 QuickPark. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default About;