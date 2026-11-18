export default function ReturnRefundPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16 text-slate-800">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9333ea]">
            Customer Assurance &amp; Warranty
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono">
            Return &amp; Refund Policy
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            30-day customer satisfaction guarantee &amp; 2-year structural hardware warranty
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none text-slate-600 space-y-7 text-sm sm:text-base leading-relaxed">
          <p>
            Thank you for shopping at <strong>PGX MarketPlace</strong>. We are committed to delivering the highest caliber of commercial gym machinery, pro studio electronics, apparel, and verified digital software. If you encounter any issue with your purchase, our dedicated support team is ready to assist.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            1. Physical Merchandise: 30-Day Return Policy
          </h2>
          <p>
            You have <strong>30 calendar days</strong> from the recorded delivery date to request a return or exchange for physical products. To qualify for a return:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Apparel &amp; Accessories:</strong> Must be unworn, unwashed, and in original packaging with all manufacturer tags intact.</li>
            <li><strong>Gym Equipment &amp; Machinery:</strong> Must be in clean, resaleable condition, safely packed in original factory freight packaging with all bolts, hardware, and accessories included.</li>
            <li><strong>Pro Tech &amp; Electronics:</strong> Must be reset to factory defaults, free of cosmetic scratches, and returned in original boxes with all included cords and adapters.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            2. Commercial 2-Year Equipment Warranty
          </h2>
          <p>
            All heavy commercial fitness equipment (Power Racks, Treadmills, Slat Belts, and Cable Crossovers) carries our comprehensive <strong>2-Year Structural Warranty</strong> covering weld structural integrity, frame durability, and factory manufacturing defects.
          </p>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            3. Digital Products &amp; Software Licenses
          </h2>
          <p>
            Due to the irrevocable nature of digital downloads and instant license generation:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Instant License Replacement:</strong> If an activation key or digital software link fails to function or is verified defective, we provide an immediate replacement key within 24 hours.</li>
            <li><strong>Digital Refunds:</strong> If a technical incompatibility cannot be resolved by our engineering desk within 7 calendar days of purchase, a full credit or refund will be issued.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            4. Damaged or Defective Freight Shipments
          </h2>
          <p>
            If any heavy machinery or package arrives with visible freight carrier damage:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Take clear photographs of the exterior pallet, cartons, and damaged components prior to assembly.</li>
            <li>Note damage with the delivery driver upon signing the bill of lading.</li>
            <li>Contact <a href="mailto:support@pgxmarketplace.shop" className="text-[#9333ea] font-bold hover:underline">support@pgxmarketplace.shop</a> within <strong>48 hours</strong> of delivery for expedited component replacement or full unit freight reshipment.</li>
          </ul>

          <h2 className="text-xl font-black uppercase font-mono text-slate-900 mt-8 mb-3">
            5. Refund Processing Timeline
          </h2>
          <p>
            Once returned merchandise is received and inspected at our regional logistics hub, refunds are initiated within <strong>2 business days</strong> to your original payment method (Stripe or PGX Wallet balance). Banking institutions typically reflect card credits within 3 to 7 business days.
          </p>
        </div>
      </div>
    </div>
  );
}
