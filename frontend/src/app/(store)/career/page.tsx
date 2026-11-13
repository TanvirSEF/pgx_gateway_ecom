import { Briefcase, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CareerPage() {
  const jobs = [
    { title: "AI Solutions & Prompt Engineer", location: "Global / Remote", type: "Full-Time", desc: "Build autonomous workflow agents, prompt templates, and custom LLM integrations for digital software products." },
    { title: "Senior Next.js & Full-Stack Architect", location: "Global / Remote", type: "Full-Time", desc: "Architect high-performance web templates, microservices, and modern frontend application kits." },
    { title: "Digital Product Growth & Marketing Lead", location: "Global / Remote", type: "Full-Time", desc: "Lead international acquisition funnels, digital product launches, and developer ecosystem partnerships." },
  ];

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7c3aed]">
            Join Our Team
          </span>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground mt-2 font-mono">
            Careers At PG<span className="text-[#7c3aed]">X</span> DIGITAL
          </h1>
          <p className="text-muted-foreground text-base mt-4">
            We are always seeking high-drive engineers, designers, and marketers passionate about building smarter digital tools and software.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {jobs.map((job, idx) => (
            <div key={idx} className="bg-card border border-border rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#7c3aed]/40 hover:shadow-md transition-all">
              <div>
                <h3 className="text-lg font-black uppercase font-mono text-card-foreground mb-2">{job.title}</h3>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground mb-3">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#7c3aed]"/> {job.location}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-[#7c3aed]"/> {job.type}</span>
                </div>
                <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">{job.desc}</p>
              </div>
              <div className="shrink-0">
                <Button className="w-full md:w-auto h-11 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors px-6 shadow-xs">
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-card text-card-foreground rounded-2xl p-8 sm:p-12 max-w-4xl mx-auto border border-border shadow-sm">
           <h3 className="text-2xl font-black uppercase font-mono tracking-tight mb-2">Don&apos;t See The Right Role?</h3>
           <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">Send us your portfolio and background. We are constantly expanding our engineering, digital design, and AI teams.</p>
           <a href="mailto:careers@pgxdigital.com" className="inline-flex items-center justify-center h-11 px-8 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-xs uppercase tracking-wider transition-all shadow-xs">
             Email Your Resume
           </a>
        </div>
      </div>
    </div>
  );
}
