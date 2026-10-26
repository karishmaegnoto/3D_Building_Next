import Header from '../../../components/Header/Header';
import Footer from '../../../components/Footer/Footer';
import PrivacyPolicy from '../../../components/modules/privacy/PrivacyPolicy';

export const metadata = {
  title: 'Privacy Policy | 3D Estimator',
  description:
    'How GripEstimator handles building design data and AI Chat inputs, the privacy rights you can exercise, and the legal framework that applies to GripEstimator services.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="app">
      <Header />
      <PrivacyPolicy />
      <Footer />
    </main>
  );
}
