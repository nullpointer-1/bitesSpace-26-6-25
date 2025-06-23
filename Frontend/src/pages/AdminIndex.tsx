
import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import StallsSection from '../components/StallsSection';
import Footer from '../components/Footer';

const AdminIndex = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <HeroSection />
      <AboutSection />
      <StallsSection />
      <Footer />
    </div>
  );
};

export default AdminIndex;