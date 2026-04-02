'use client';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__section">
            <h3 className="footer__title">3D Estimator</h3>
            <p className="footer__description">
              Building the future, one structure at a time.
            </p>
            <div className="footer__social">
              <a href="#" className="footer__social-link" aria-label="Facebook">📘</a>
              <a href="#" className="footer__social-link" aria-label="Twitter">🐦</a>
              <a href="#" className="footer__social-link" aria-label="Instagram">📷</a>
              <a href="#" className="footer__social-link" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          <div className="footer__section">
            <h4 className="footer__subtitle">Services</h4>
            <ul className="footer__links">
              <li><a href="#">Carports</a></li>
              <li><a href="#">Barns</a></li>
              <li><a href="#">Warehouses</a></li>
              <li><a href="#">Custom Buildings</a></li>
            </ul>
          </div>

          <div className="footer__section">
            <h4 className="footer__subtitle">Contact</h4>
            <div className="footer__contact">
              <p>📞 (555) 123-4567</p>
              <p>📧 info@3destimator.com</p>
              <p>📍 123 Builder St, Construction City</p>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; 2026 3D Estimator. All rights reserved.</p>
          <span className="footer__tagline">Engineered for Precision</span>
        </div>
      </div>
    </footer>
  );
}