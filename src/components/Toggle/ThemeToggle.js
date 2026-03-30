'use client';
import { useTheme } from '../ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      <div className="theme-toggle__track">
        <div
          className={`theme-toggle__thumb ${
            theme === 'dark' ? 'theme-toggle__thumb--dark' : ''
          }`}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
}
