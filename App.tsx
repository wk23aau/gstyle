
import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50"> {/* Added bg-gray-50 for overall page background, consistent with Material-ish light theme */}
      <Navbar />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8"> {/* Adjusted padding for responsiveness */}
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
};

export default App;