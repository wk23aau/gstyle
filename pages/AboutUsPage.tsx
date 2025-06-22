
import React from 'react';

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto my-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          About AI CV Maker
        </h1>
        <p className="text-xl text-gray-600">
          Crafting Your Future, Intelligently.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Our Story</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          AI CV Maker was born from a simple idea: to make professional CV creation accessible, efficient, and highly effective for everyone. We saw talented individuals struggling to translate their skills and experiences into compelling CVs that truly stood out to employers. In a fast-paced job market, we knew technology, specifically Artificial Intelligence, could bridge this gap.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Our journey began with a dedicated team of HR experts, AI specialists, and UX designers passionate about empowering job seekers. We've poured countless hours into developing an intelligent platform that not only generates CVs but also provides strategic insights tailored to specific job roles and industries.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed">
          Our mission is to empower job seekers worldwide by providing an advanced, AI-driven tool that simplifies and enhances the CV creation process. We aim to help you articulate your professional value clearly, secure more interviews, and ultimately, land your dream job.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Our Vision</h2>
        <p className="text-gray-700 leading-relaxed">
          We envision a future where crafting a high-impact CV is no longer a barrier but a catalyst for career advancement. AI CV Maker strives to be the leading platform for intelligent career document creation, continuously evolving with the job market and AI technology to offer unparalleled support to professionals at every stage of their careers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">The AI Advantage</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Leveraging the power of cutting-edge AI models, AI CV Maker goes beyond traditional templates. Our platform analyzes job descriptions, identifies key skills and qualifications, and suggests tailored content to ensure your CV is optimized for Applicant Tracking Systems (ATS) and human recruiters alike.
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
          <li>Tailored content suggestions based on job roles.</li>
          <li>Keyword optimization for ATS compatibility.</li>
          <li>Professional formatting and structuring.</li>
          <li>Time-saving and efficient CV building.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-3">Why Choose Us?</h2>
        <p className="text-gray-700 leading-relaxed">
          At AI CV Maker, we are committed to your success. We combine technological innovation with a deep understanding of the recruitment landscape to provide a tool that is not only smart but also user-friendly and reliable. Join thousands of successful professionals who have transformed their job search with AI CV Maker.
        </p>
      </section>
    </div>
  );
};

export default AboutUsPage;