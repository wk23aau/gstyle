
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = "October 26, 2023"; // Example date - Consider making this dynamic or easily updatable

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto my-8 text-gray-700 leading-relaxed">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-3">
          Privacy Policy
        </h1>
        <p className="text-md text-gray-500">Last Updated: {lastUpdated}</p>
      </header>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">1. Introduction</h2>
        <p className="mb-3">
          Welcome to AI CV Maker ("we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered CV generation services (collectively, the "Services").
        </p>
        <p>
          Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site or use our Services.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">2. Information We Collect</h2>
        <p className="mb-3">We may collect information about you in a variety of ways. The information we may collect via the Services includes:</p>
        <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
          <li>
            <strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, phone number, LinkedIn profile URL, address, date of birth, and any other information you voluntarily provide to us when you register for the Services or fill out your user profile.
          </li>
          <li>
            <strong>CV Content:</strong> All information you input for CV generation, including job titles, job descriptions, work experience details, education history, skills, and any other text or data you provide to be processed by our AI model for the purpose of creating your CV.
          </li>
          <li>
            <strong>Usage Data:</strong> Information automatically collected when you access and use the Services, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Site. This may also include information about your interactions with our Services, like features utilized.
          </li>
          <li>
            <strong>Authentication Data:</strong> If you register or log in using Google, we will collect authentication information provided by Google, such as your Google ID, name, and email, as permitted by your Google account settings and Google's policies.
          </li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">3. How We Use Your Information</h2>
        <p className="mb-3">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Services to:</p>
        <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
          <li>Create and manage your account.</li>
          <li>Generate CVs and related career documents based on the information you provide and the job inputs.</li>
          <li>Improve our AI models and the overall quality of the CV generation service (typically using anonymized or aggregated data).</li>
          <li>Personalize your experience and allow us to deliver the type of content and product offerings in which you are most interested.</li>
          <li>Communicate with you about your account or our services, including updates and administrative messages.</li>
          <li>Monitor and analyze usage and trends to improve your experience with the Services.</li>
          <li>Protect the security and integrity of our Services, prevent fraud, and enforce our Terms of Service.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">4. Disclosure of Your Information</h2>
        <p className="mb-3">We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
        <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
          <li>
            <strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
          </li>
          <li>
            <strong>Third-Party Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., cloud hosting, AI model providers, database management, analytics providers). We make efforts to ensure these third parties handle your data securely and only for the purposes we specify.
          </li>
          <li>
            <strong>AI Model Interaction:</strong> Information you provide for CV generation (job info, your profile data) is sent to our third-party AI model provider to generate CV content. We aim to use AI services that prioritize data privacy and security. Please refer to our <Link to="/gdpr-consent" className="text-blue-600 hover:underline">Data Sharing & GDPR Consent</Link> page for more details.
          </li>
          <li>
            <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
          </li>
          <li>
            <strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.
          </li>
        </ul>
        <p>We do not sell your personal information to third parties for their direct marketing purposes.</p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">5. Data Security</h2>
        <p className="mb-3">
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">6. Data Retention</h2>
        <p className="mb-3">
          We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">7. Your Data Protection Rights</h2>
        <p className="mb-3">
          Depending on your location, you may have certain rights regarding your personal information. These may include the right to:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
          <li>Request access to and obtain a copy of your personal information.</li>
          <li>Request correction of any inaccurate or incomplete personal information.</li>
          <li>Request erasure of your personal information.</li>
          <li>Restrict or object to the processing of your personal information.</li>
          <li>Request portability of your personal information.</li>
          <li>Withdraw your consent at any time (if processing is based on consent).</li>
        </ul>
        <p>
           To exercise these rights, please contact us using the contact information provided below or on our <Link to="/contact-us" className="text-blue-600 hover:underline">Contact Us</Link> page. For more details specific to GDPR, please see our <Link to="/gdpr-consent" className="text-blue-600 hover:underline">Data Sharing & GDPR Consent</Link> page.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">8. Cookies and Tracking Technologies</h2>
        <p className="mb-3">
          We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Site to help customize the Site and improve your experience. When you access the Site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Site.
        </p>
        <p className="mb-3">
          Our site uses Google Analytics for tracking page views and user interactions as described in our <Link to="/gdpr-consent" className="text-blue-600 hover:underline">Data Sharing & GDPR Consent</Link> page. For more information on how Google uses data when you use our partners' sites or apps, visit <a href="https://www.google.com/policies/privacy/partners/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.google.com/policies/privacy/partners/</a>.
        </p>
        <p>
          For more information on advertising cookies and how to opt out, please see Section 9 below.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">9. Third-Party Advertising</h2>
        <p className="mb-3">
          We may use third-party advertising companies, such as Google AdSense, to serve ads when you visit the Site. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
        </p>
        <p className="mb-3">
          These third-party ad servers or ad networks use technology like cookies, JavaScript, or Web Beacons that are sent directly to your browser. They automatically receive your IP address when this happens. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see.
        </p>
        <p className="mb-3">
          AI CV Maker has no access to or control over these cookies that are used by third-party advertisers. You should consult the respective privacy policies of these third-party ad servers for more detailed information on their practices as well as for instructions about how to opt-out of certain practices. Our privacy policy does not apply to, and we cannot control the activities of, such other advertisers or web sites.
        </p>
        <p className="mb-3">
          If you wish to disable cookies, you may do so through your individual browser options. More detailed information about cookie management with specific web browsers can be found at the browsers' respective websites.
        </p>
        <p className="mb-3">
          Users in the European Economic Area (EEA) and the UK will be asked to consent to the use of cookies for personalized advertising before such cookies are set.
        </p>
        <p className="mb-3">
          You can opt out of personalized advertising by visiting:
        </p>
        <ul className="list-disc list-inside space-y-2 pl-4 mb-3">
          <li>Google's Ad Settings: <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://www.google.com/settings/ads</a></li>
          <li>Network Advertising Initiative (NAI) opt-out page: <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://optout.networkadvertising.org/</a></li>
          <li>Digital Advertising Alliance (DAA) opt-out page: <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://optout.aboutads.info/</a></li>
        </ul>
        <p>
          Please note that opting out of personalized advertising does not mean you will no longer see ads, but that the ads you see may be less relevant to your interests.
        </p>
      </section>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">10. Children's Privacy</h2>
        <p className="mb-3">
            Our Services are not directed to individuals under the age of 16 (or other age as required by local law), and we do not knowingly collect personal information from children. If we become aware that we have inadvertently collected personal information from a child, we will take reasonable steps to delete such information.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">11. Changes to This Privacy Policy</h2>
        <p className="mb-3">
          We may update this privacy policy from time to time. The updated version will be indicated by an updated "Last Updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy policy frequently to be informed of how we are protecting your information.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">12. Contact Us</h2>
        <p>
          If you have questions or comments about this privacy policy, please contact us through our <Link to="/contact-us" className="text-blue-600 hover:underline">Contact Us</Link> page or at <a href="mailto:privacy@aicvmaker.com" className="text-blue-600 hover:underline">privacy@aicvmaker.com</a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
