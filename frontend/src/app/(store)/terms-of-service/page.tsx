export default function TermsOfServicePage() {
  return (
    <div className="bg-white min-h-screen py-16 text-slate-800">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9333ea]">
            Legal &amp; Compliance
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Last updated: November 2026 | Effective for PGX MarketPlace (<a href="https://pgxmarketplace.shop" className="text-[#9333ea] hover:underline font-semibold">pgxmarketplace.shop</a>)
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-slate-600 space-y-7 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to <strong>PGX MarketPlace</strong> (&quot;PGX&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our website (<a href="https://pgxmarketplace.shop" className="text-[#9333ea] hover:underline font-medium">pgxmarketplace.shop</a>), services, commercial hardware, fitness gear, apparel, electronics, and digital products.
          </p>
          <p>
            By accessing our store, creating an account, or placing an order, you agree to be legally bound by these Terms and our Privacy Policy. If you do not agree, you must discontinue use of the platform immediately.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            1. Commercial Marketplace Scope
          </h2>
          <p>
            PGX MarketPlace operates as an all-in-one commercial and digital e-commerce ecosystem offering:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Physical Commercial Equipment:</strong> Heavy gym machinery, power racks, treadmills, pro camera rigs, workstations, and high-performance lifestyle apparel.</li>
            <li><strong>Digital Solutions &amp; Licenses:</strong> Commercial software licenses, AI tools, website templates, developer scripts, and educational media.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            2. Orders, Pricing &amp; Payments
          </h2>
          <p>
            All prices are listed in USD ($) and are subject to change without prior notice. We reserve the right to cancel or modify orders that contain typographical errors, pricing inaccuracies, or unauthorized fraudulent transactions.
          </p>
          <p>
            Payments are securely processed via industry-standard PCI-DSS compliant providers including Stripe, verified credit/debit cards, and authorized PGX Wallet balances. We do not store unencrypted payment credentials on our application servers.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            3. Shipping, Freight &amp; Digital Fulfillment
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Physical Freight:</strong> Heavy hardware and machinery ship via certified freight carriers with tracking and scheduled delivery appointments. Delivery timescales depend on recipient jurisdiction and customs clearance.</li>
            <li><strong>Instant Digital Delivery:</strong> Software license keys, activation codes, and repository access links are delivered instantly to your registered account dashboard and email upon verified checkout completion.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            4. Digital Licensing &amp; Intellectual Property
          </h2>
          <p>
            When purchasing digital products (software, templates, prompts, media), you are granted a non-exclusive, non-transferable, revocable commercial license for internal or client project use. You may not resell, redistribute, sub-license, or publicly leak raw codebases or license keys.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            5. Warranties &amp; Limitation of Liability
          </h2>
          <p>
            Physical commercial equipment is protected by our certified 2-Year Manufacturer &amp; Structural Warranty. To the maximum extent permitted by applicable law, PGX MarketPlace shall not be liable for indirect, incidental, punitive, or consequential damages resulting from product misuse, operational downtime, or third-party carrier delays.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            6. Governing Law &amp; Inquiries
          </h2>
          <p>
            These Terms are governed by and construed in accordance with applicable commercial e-commerce regulations. For any legal inquiries, enterprise agreements, or compliance questions, contact our legal desk at <a href="mailto:support@pgxmarketplace.shop" className="text-[#9333ea] font-bold hover:underline">support@pgxmarketplace.shop</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
