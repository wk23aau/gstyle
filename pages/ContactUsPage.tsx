
import React from 'react';

const ContactUsPage: React.FC = () => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 lg:p-10 max-w-3xl mx-auto my-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
          Get in Touch
        </h1>
        <p className="text-xl text-gray-600">
          We're here to help and answer any questions you might have.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Contact Information</h2>
        <p className="text-gray-700 leading-relaxed mb-2">
          For support, inquiries, or feedback, please reach out to us:
        </p>
        <ul className="list-none space-y-3 text-gray-700">
          <li>
            <strong>Email Support:</strong> <a href="mailto:support@aicvmaker.com" className="text-blue-600 hover:text-blue-700 hover:underline">support@aicvmaker.com</a>
            <p className="text-sm text-gray-500">We typically respond within 24-48 business hours.</p>
          </li>
          <li>
            <strong>Mailing Address (Placeholder):</strong>
            <p className="text-gray-600">123 AI Avenue, Innovation City, Tech State, 90210</p>
          </li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Feedback & Suggestions</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Your feedback is invaluable to us! If you have any suggestions on how we can improve AI CV Maker, or if you've encountered any issues, please don't hesitate to let us know. We are constantly working to enhance our platform and provide the best possible experience for our users.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Business Inquiries</h2>
        <p className="text-gray-700 leading-relaxed">
          For partnership opportunities, media inquiries, or other business-related matters, please contact us at <a href="mailto:business@aicvmaker.com" className="text-blue-600 hover:text-blue-700 hover:underline">business@aicvmaker.com</a>.
        </p>
      </section>

      {/* Placeholder for a contact form if needed in the future */}
      {/* 
      <section className="mt-10 pt-6 border-t border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Send Us a Message (Form Placeholder)</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="name" id="name" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="email" id="email" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea name="message" id="message" rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <div>
            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              Send Message (UI Only)
            </button>
          </div>
        </form>
      </section>
      */}
    </div>
  );
};

export default ContactUsPage;
