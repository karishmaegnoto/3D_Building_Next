'use client';

import Header from '../components/Header/Header';
import Hero from '../components/Hero/HeroSection';
import Features from '../components/Features/Feature';
import BuildingConfigurator from '../components/BuildingConfigurator/BuildingConfig';
import Footer from '../components/Footer/Footer';

export default function Home() {
  return (
    <main className="app">
      <Header />
      <Hero />
      <Features />
      <BuildingConfigurator />
      <Footer />
    </main>
  )
}