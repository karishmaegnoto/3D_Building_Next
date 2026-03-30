'use client';
import { useState } from 'react';
import { useTheme } from '../ThemeProvider';
import ThemeToggle from '../Toggle/ThemeToggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <div className="logo-3d">
            <span className="logo-text">3D</span>
            <span className="logo-sub">ESTIMATOR</span>
          </div>
        </div>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            <li><a href="#home" className="header__nav-link">Home</a></li>
            <li><a href="#features" className="header__nav-link">Features</a></li>
            <li><a href="#configurator" className="header__nav-link">Configure</a></li>
            <li><a href="#contact" className="header__nav-link">Contact</a></li>
          </ul>
        </nav>

        <div className="header__actions">
          <button
            className="header__btn header__btn--primary"
            onClick={() => window.open(process.env.NEXT_PUBLIC_ESTIMATOR_URL, "_blank")}
          >
            <span className="btn-icon">🏗️</span>
            3D Estimator
          </button>
          <button className="header__btn header__btn--secondary">
            <span className="btn-icon">🤖</span>
            Meta AI
          </button>
          <ThemeToggle />

          <button
            className="header__menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}
