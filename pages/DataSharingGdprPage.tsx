
import React from 'react';
import { Link } from 'react-router-dom';

const DataSharingGdprPage: React.FC = () => {
  const lastUpdated = "October 26, 2023"; // Example date

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto my-8 text-gray-700 leading-relaxed">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-3">
          Data Sharing, AI, & Your GDPR Rights
        </h1>
        <p className="text-md text-gray-500">Last Updated: {lastUpdated}</p>
      </header>

      <p className="mb-6 text-lg">
        At AI CV Maker, transparency about how your data is used is paramount, especially when interacting with advanced AI technologies. This page details how your data is handled in relation to our AI-powered CV generation services and outlines your rights under the General Data Protection Regulation (GDPR).
      </p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">1. What Data Do We Process for AI CV Generation?</h2>
        <p className="mb-3">To provide you with tailored CV outlines, our AI models need to process the information you provide. This includes:</p>
        <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
          <li>
            <strong>Job Information:</strong> The job title or job description you input for which you want a CV.
          </li>
          <li>
            <strong>Your Profile Data (if logged in and provided):</strong> Information from your user profile, such as past work experiences, education, skills, and personal details, is used to customize the CV outline further.
          </li>
        </ul>
        <p>
          We strive to use only the necessary data to generate relevant and high-quality CV content for you.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">2. How Is Your Data Shared with AI Models?</h2>
        <p className="mb-3">
          When you request a CV generation, the relevant data mentioned above is sent to our third-party AI model provider via a secure API. The AI model processes this data to understand the context and generate a CV outline.
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
          <li>
            <strong>Purpose Limitation:</strong> Your data is shared with the AI model solely for the purpose of generating the CV content you requested.
          </li>
          <li>
            <strong>Data Security in Transit:</strong> We use encrypted connections (HTTPS) to transmit data to and from the AI service.
          </li>
          <li>
            <strong>AI Provider Policies:</strong> We rely on the data privacy and security commitments of our AI provider. They typically do not use data submitted via their enterprise APIs to train their general models unless explicitly stated or configured otherwise. We encourage you to review the API-specific data usage policies of such providers.
          </li>
        </ul>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">3. Your Consent</h2>
        <p className="mb-3">
          By using the AI CV generation feature of our Services, you consent to the processing and sharing of your provided information (job details and relevant profile data) with our AI model provider as described herein for the purpose of creating your CV.
        </p>
        <p className="mb-3">
          If you are not comfortable with this data processing, please refrain from using the AI CV generation feature. You can still use other aspects of our platform if applicable.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">4. Data Storage and AI Model Training</h2>
        <p className="mb-3">
          The CV content generated for you is stored in your account if you are a registered user, allowing you to access and edit it later.
        </p>
        <p className="mb-3">
          AI CV Maker may use anonymized or aggregated data derived from user interactions and generated content to improve our Services, including fine-tuning our prompts or understanding common CV patterns. However, your direct personal identifiers are not used for training general AI models by our providers unless explicitly stated and consented to under specific programs (which is not our current practice for standard API usage).
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">5. Your Rights Under GDPR</h2>
        <p className="mb-3">
          If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have certain data protection rights under the GDPR. These include:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
          <li>
            <strong>The right to access:</strong> You have the right to request copies of your personal data.
          </li>
          <li>
            <strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete. Your user dashboard allows you to update most of your profile information directly.
          </li>
          <li>
            <strong>The right to erasure (right to be forgotten):</strong> You have the right to request that we erase your personal data, under certain conditions.
          </li>
          <li>
            <strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.
          </li>
          <li>
            <strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.
          </li>
          <li>
            <strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.
          </li>
          <li>
            <strong>The right to withdraw consent:</strong> If we are processing your personal data based on your consent, you have the right to withdraw that consent at any time.
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact us via our <Link to="/contact-us" className="text-blue-600 hover:underline">Contact Us</Link> page or email us at <a href="mailto:privacy@aicvmaker.com" className="text-blue-600 hover:underline">privacy@aicvmaker.com</a>. We will respond to your request within the timeframes mandated by GDPR.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">6. Google Analytics and Cookies</h2>
        <p className="mb-3">
            We use Google Analytics to understand how our visitors use the site. Google Analytics collects information such as how often users visit this site, what pages they visit when they do so, and what other sites they used prior to coming to this site. We use the information we get from Google Analytics only to improve this site. Google Analytics collects only the IP address assigned to you on the date you visit this site, rather than your name or other identifying information. We do not combine the information collected through the use of Google Analytics with personally identifiable information.
        </p>
        <p className="mb-3">
            Google's ability to use and share information collected by Google Analytics about your visits to this site is restricted by the Google Analytics Terms of Use and the Google Privacy Policy. You can prevent Google Analytics from recognizing you on return visits to this site by disabling cookies on your browser. For more general information on cookies, please see our <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
        </p>
        <p className="mb-3">
            If we implement third-party advertising on our Site, please be aware that these ad networks may use their own cookies and tracking technologies. For users in regions where GDPR or similar regulations apply, we will seek your explicit consent for the use of cookies for personalized advertising before such cookies are set. This consent will be managed through a cookie consent mechanism on our Site. Ad networks operate under their own privacy policies, which you should review.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">7. Contact Us for Data Inquiries</h2>
        <p>
          For any questions or concerns regarding your data, its use with AI, or your GDPR rights, please do not hesitate to reach out. You can find our contact details on the <Link to="/contact-us" className="text-blue-600 hover:underline">Contact Us</Link> page.
        </p>
      </section>
    </div>
  );
};

export default DataSharingGdprPage;
