import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Destinations from '../components/Destinations';
import Stats from '../components/Stats';
import Promo from '../components/Promo';
import Tours from '../components/Tours';
import Partners from '../components/Partners';
import Testimonials from '../components/Testimonials';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

const Home = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main>
        <Hero />
        {/* Packages section removed from here */}
        <Destinations />
        <Stats />
        <Promo />
        <Tours />
        <Partners />
        <Testimonials />
        <Blog />
        <Contact />
        <Newsletter />
      </main>
      <Footer />
      
      <WhatsAppButton />

      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Home;