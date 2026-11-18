import { Sparkles, ShieldCheck, Zap, DownloadCloud, Users, Laptop } from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c3aed]">
            Our Story &amp; Mission
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mt-2 font-mono">
            About PG<span className="text-[#7c3aed]">X</span> MarketPlace
          </h1>
          <p className="text-muted-foreground text-base mt-4 leading-relaxed">
            Smarter Tools. Better Results. Empowering developers, creators, entrepreneurs, and agencies worldwide with instant digital assets.
          </p>
        </div>

        {/* Hero Banner Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0c0728] to-[#1e1045] border border-purple-900/40 p-8 sm:p-12 text-white overflow-hidden shadow-xl mb-16">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-mono text-purple-400 font-bold">
              Digital Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight mt-2 font-mono text-white">
              Built For The Modern Digital Creator
            </h2>
            <p className="text-purple-200 text-sm sm:text-base mt-4 leading-relaxed">
              At PGX MarketPlace, we engineer and curate premium software licenses, autonomous AI agents, enterprise-grade website templates, and actionable digital guides. Every asset is rigorously vetted to accelerate your workflow and elevate your business.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Laptop className="w-96 h-96 text-purple-300" />
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-[#7c3aed]/40 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center mb-4">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-foreground mb-2">
              Instant Delivery
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Zero shipping delays. Get automated license keys, repositories, and direct download links immediately upon checkout.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 text-left hover:border-[#7c3aed]/40 hover:shadow-xs transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-foreground mb-2">
              100% Secure &amp; Verified
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All digital tools, scripts, and software are thoroughly audited, malware-free, and guaranteed authentic with lifetime access.
            </p>
          </div>

          <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-6 text-left hover:border-slate-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#a855f7] flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-black uppercase text-base text-slate-900 mb-2">
              24/7 Priority Support
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Technical engineers and digital specialists standing by around the clock to assist with licensing, setup, and integrations.
            </p>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-slate-700 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 font-mono">
            Our Commitment
          </h2>
          <p className="leading-relaxed text-sm sm:text-base">
            Whether you are launching your next SaaS product, automating marketing funnels with AI, or scaling client deliverables, PGX MarketPlace delivers clean, high-performance digital architecture and battle-tested codebases.
          </p>
          <p className="leading-relaxed text-sm sm:text-base">
            Every digital product comes with clear documentation, updates, and lifetime access to ensure you build faster and operate smarter.
          </p>
        </div>
      </div>
    </div>
  );
}
