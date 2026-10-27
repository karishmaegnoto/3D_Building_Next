'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../ThemeProvider';
import ThemeToggle from '../Toggle/ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home', hash: '#home' },
  { label: 'Features', hash: '#features' },
  { label: 'Configure', hash: '#configurator' },
  { label: 'Contact', hash: '#contact' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === '/';
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="header__container">
        <div className="header__logo">
          <div className="logo-3d">
            {/* <span className="logo-text">3D</span>
            <span className="logo-sub">ESTIMATOR</span> */}

            <Link href="/" aria-label="3D Estimator home" onClick={closeMenu}>
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
            </Link>
          </div>
        </div>

        <nav className={`header__nav ${isMenuOpen ? 'header__nav--open' : ''}`}>
          <ul className="header__nav-list">
            {NAV_ITEMS.map(({ label, hash }) => (
              <li key={hash}>
                {isHome ? (
                  <a href={hash} className="header__nav-link" onClick={closeMenu}>
                    {label}
                  </a>
                ) : (
                  <Link href={`/${hash}`} className="header__nav-link" onClick={closeMenu}>
                    {label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/privacy-policy"
                className="header__nav-link"
                aria-current={pathname === '/privacy-policy' ? 'page' : undefined}
                onClick={closeMenu}
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>


         <div className="header__actions">
          {/* Sales View Login */}
          <button
            type="button"
            className="header__btn header__btn--primary"
            disabled
            aria-disabled="true"
            tabIndex={-1}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
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
    </header >
  );
}
