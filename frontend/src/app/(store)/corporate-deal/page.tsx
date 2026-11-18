import { Building2, Handshake, Mail, ShieldCheck, Key, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CorporateDealPage() {
  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c3aed]">
            B2B &amp; Enterprise Licensing
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mt-2 font-mono flex items-center justify-center gap-3">
            <Handshake className="w-9 h-9 text-[#7c3aed]" /> Team &amp; Enterprise Deals
          </h1>
          <p className="text-muted-foreground text-base mt-4">
            Partner with PGX MarketPlace for multi-seat software licenses, agency bundles, white-label AI tools, and enterprise developer tools.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          <div className="flex-1 space-y-8">
            <div className="bg-card text-card-foreground rounded-2xl p-8 border border-border shadow-xs space-y-6">
              <span className="text-xs uppercase tracking-widest font-mono text-[#7c3aed] font-bold">
                Enterprise Benefits
              </span>
              <h3 className="text-2xl font-black uppercase tracking-tight font-mono text-foreground">
                Why Partner With PGX MarketPlace?
              </h3>
              <ul className="space-y-4 pt-2">
                <li className="flex items-start gap-3">
                  <div className="bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                  <span className="text-muted-foreground text-sm">Tiered volume discounts for developer teams &amp; creative agencies.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                  <span className="text-muted-foreground text-sm">Extended commercial &amp; redistribution licenses for enterprise products.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                  <span className="text-muted-foreground text-sm">Custom API integrations &amp; white-label AI automation workflows.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs">✓</div>
                  <span className="text-muted-foreground text-sm">Dedicated enterprise account manager &amp; priority 24/7 technical onboarding.</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground bg-card p-6 rounded-xl border border-border">
              <Mail className="w-5 h-5 text-[#7c3aed]" />
              <span className="text-sm">Or email directly: <a href="mailto:support@pgxmarketplace.shop" className="font-bold text-foreground hover:text-[#7c3aed] underline transition-colors">support@pgxmarketplace.shop</a></span>
            </div>
          </div>

          <div className="w-full lg:w-[480px]">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-xs">
              <h2 className="text-xl font-black uppercase tracking-tight text-card-foreground mb-6 flex items-center gap-2 font-mono">
                <Building2 className="w-5 h-5 text-[#7c3aed]" /> Request Enterprise Quote
              </h2>
              <form className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company / Organization *</label>
                  <Input placeholder="Apex Tech Labs" required className="bg-background border-border focus:border-[#7c3aed]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Person *</label>
                  <Input placeholder="Alex Miller" required className="bg-background border-border focus:border-[#7c3aed]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Work Email *</label>
                  <Input type="email" placeholder="alex@company.com" required className="bg-background border-border focus:border-[#7c3aed]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Team Size / Seats</label>
                  <Input placeholder="E.g., 25 - 50 Seats" className="bg-background border-border focus:border-[#7c3aed]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Software / Asset Requirements</label>
                  <Textarea placeholder="E.g., 20 Software Licenses, AI Agents, Enterprise Landing Page Systems..." rows={4} required className="resize-none bg-background border-border focus:border-[#7c3aed]" />
                </div>
                <Button className="w-full h-12 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors shadow-xs">
                  Submit Inquiry
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
