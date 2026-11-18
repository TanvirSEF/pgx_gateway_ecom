export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16 text-slate-800">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9333ea]">
            Legal &amp; Privacy Protection
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Last updated: November 2026 | Effective for PGX MarketPlace (<a href="https://pgxmarketplace.shop" className="text-[#9333ea] hover:underline font-semibold">pgxmarketplace.shop</a>)
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-slate-600 space-y-7 text-sm sm:text-base leading-relaxed">
          <p>
            At <strong>PGX MarketPlace</strong> (&quot;PGX&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), protecting your privacy and personal data is our utmost priority. This Privacy Policy details the types of information we collect, how it is safeguarded, and how you can exercise your data privacy rights across <a href="https://pgxmarketplace.shop" className="text-[#9333ea] hover:underline font-medium">pgxmarketplace.shop</a>.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            1. Information We Collect
          </h2>
          <p>
            We collect information strictly necessary to process your transactions, manage deliveries, and secure your account:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account &amp; Identity:</strong> Name, email address, password hash, and phone number for account administration.</li>
            <li><strong>Shipping &amp; Logistics:</strong> Physical street address, city, postal code, and delivery instructions for freight and parcel shipments.</li>
            <li><strong>Payment Information:</strong> Transaction IDs, payment status, and billing zip codes handled via certified PCI-DSS Level 1 processors (Stripe). We do not store raw credit card numbers.</li>
            <li><strong>Device &amp; Telemetry Data:</strong> IP address, device specifications, browser cookies, and session logs utilized to prevent fraud and maintain platform performance.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            2. How We Use Your Information
          </h2>
          <p>
            Your information is utilized solely for lawful commercial and operational purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fulfilling physical merchandise and delivering digital software licenses.</li>
            <li>Providing order tracking, delivery notifications, and warranty records.</li>
            <li>Detecting and mitigating fraud, chargebacks, and unauthorized system access.</li>
            <li>Communicating product updates, safety notices, and priority customer support.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            3. Information Sharing &amp; Third Parties
          </h2>
          <p>
            We do not sell, rent, or trade your personal information. Data is shared exclusively with vetted operational partners:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Payment Gateways:</strong> Stripe for encrypted card and digital wallet transactions.</li>
            <li><strong>Logistics Providers:</strong> Freight carriers (FedEx, UPS, DHL, freight lines) to deliver physical goods to your door.</li>
            <li><strong>Cloud Infrastructure:</strong> High-security hosting environments with end-to-end encryption.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            4. Data Security Standards
          </h2>
          <p>
            All network communication across <a href="https://pgxmarketplace.shop" className="text-[#9333ea] hover:underline">pgxmarketplace.shop</a> is protected by TLS 1.3 encryption. Internal access to customer data is strictly controlled through role-based access privileges and multi-factor authentication.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            5. Your Rights &amp; Privacy Desk
          </h2>
          <p>
            Depending on your jurisdiction (such as GDPR in Europe or CCPA in California), you have the right to request access to, correction of, or permanent deletion of your stored personal information.
          </p>
          <p>
            To submit a privacy or data request, contact our Data Privacy Officer at <a href="mailto:support@pgxmarketplace.shop" className="text-[#9333ea] font-bold hover:underline">support@pgxmarketplace.shop</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
