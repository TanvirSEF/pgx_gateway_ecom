import {
  Sparkles,
  ShieldCheck,
  Zap,
  Truck,
  Dumbbell,
  Laptop,
  Headphones,
} from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="bg-white min-h-screen py-16 text-slate-800">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#9333ea]">
            Our Story &amp; Mission
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 mt-2 font-mono">
            About PG<span className="text-[#9333ea]">X</span> MarketPlace
          </h1>
          <p className="text-slate-500 text-base mt-4 leading-relaxed font-medium">
            Fitness. Fashion. Tech. Digital. All in one marketplace engineered for commercial gyms, tech innovators, creators, and modern enterprises worldwide.
          </p>
        </div>

        {/* Hero Banner Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0c0728] to-[#1e1045] border border-purple-900/40 p-8 sm:p-12 text-white overflow-hidden shadow-xl mb-16 select-none">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-mono text-purple-400 font-bold">
              The All-In-One Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mt-2 font-mono text-white">
              Built For Performance &amp; Digital Scale
            </h2>
            <p className="text-purple-200 text-sm sm:text-base mt-4 leading-relaxed">
              At PGX MarketPlace, we bridge high-performance commercial equipment with state-of-the-art digital assets. From heavy-duty fitness rigs and studio camera packages to enterprise AI software and production codebases, we power your operational excellence.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Dumbbell className="w-96 h-96 text-purple-300" />
          </div>
        </div>

        {/* Feature Highlights 3-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-6 text-left hover:border-[#9333ea]/40 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-100/70 text-[#9333ea] flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-slate-900 mb-2">
              Worldwide Shipping &amp; Logistics
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Certified commercial freight partners delivering heavy machinery, racks, and premium lifestyle apparel directly to your door.
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-6 text-left hover:border-[#9333ea]/40 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-100/70 text-[#9333ea] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-slate-900 mb-2">
              Instant Digital Fulfillment
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Zero wait times for software licenses, AI automation tools, website templates, and developer kits with direct dashboard access.
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-6 text-left hover:border-[#9333ea]/40 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-purple-100/70 text-[#9333ea] flex items-center justify-center mb-4">
              <Headphones className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-slate-900 mb-2">
              24/7 Dedicated Support
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Specialists standing by around the clock to support commercial gym fitouts, warranty tracking, licensing, and order inquiries.
            </p>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="bg-[#f8fafc] border border-slate-200/90 rounded-3xl p-8 sm:p-10 text-slate-700 space-y-5">
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 font-mono">
            Our Quality Guarantee
          </h2>
          <p className="leading-relaxed text-sm sm:text-base">
            Whether you are outfitting a commercial fitness facility, investing in high-ticket cinema optics, or accelerating web engineering workflows with AI, PGX MarketPlace delivers verified authenticity, rigorous quality inspection, and dependable warranties.
          </p>
          <p className="leading-relaxed text-sm sm:text-base">
            Every physical product comes backed by manufacturer warranties, and every digital license is verified malware-free with lifetime updates and priority assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
