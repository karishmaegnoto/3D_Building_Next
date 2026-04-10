"use client";
import { useState } from "react";
import { useTheme } from "../ThemeProvider";
import ThemeToggle from "../Toggle/ThemeToggle";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <div className="logo-3d">
            {/* <span className="logo-text">3D</span>
            <span className="logo-sub">ESTIMATOR</span> */}

            {/* <Link to="/"> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
            >
              <path
                d="M42.3077 50H7.69231C3.44231 50 0 46.5577 0 42.3077V7.69231C0 3.44231 3.44231 0 7.69231 0H42.3077C46.5577 0 50 3.44231 50 7.69231V42.3077C50 46.5577 46.5577 50 42.3077 50Z"
                fill="#12131A"
              />
              <path
                d="M43.7386 17.1114V5.76904H6.26172V44.2306H25.1309L38.8079 30.5383V44.2306H43.7386V22.0421H38.8079H22.5348V26.9729H35.4386L23.1117 39.2998H11.1925V10.6998H38.8079V17.1114H43.7386Z"
                fill="white"
              />
            </svg>
            {/* </Link> */}
          </div>
        </div>

        <nav className={`header__nav ${isMenuOpen ? "header__nav--open" : ""}`}>
          <ul className="header__nav-list">
            <li>
              <a href="#home" className="header__nav-link">
                Home
              </a>
            </li>
            <li>
              <a href="#features" className="header__nav-link">
                Features
              </a>
            </li>
            <li>
              <a href="#configurator" className="header__nav-link">
                Configure
              </a>
            </li>
            <li>
              <a href="#contact" className="header__nav-link">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="header__actions">
          {/* 3D Estimator Button */}
          {/* <button
            className="header__btn header__btn--primary"
            onClick={() => {
              // Set a temporary cookie to allow access
              document.cookie =
                "allowEstimator=true; path=/; secure; samesite=strict";
              window.open("/estimator/", "_blank");
            }}
          >
            <span className="btn-icon">🏗️</span>
            3D Estimator
          </button> */}

          {/* Sales View Login */}
          <button
            className="header__btn header__btn--primary"
            onClick={() => window.open("https://gripestimator.com/salesview/login", "_blank")}
          >
            <span className="btn-icon"></span>
            Sales View Login
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
