import Link from 'next/link';
import { Shield, Zap, Globe, Cpu, ArrowRight, Link as LinkIcon, Server } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">
              N
            </div>
            <span className="font-bold tracking-widest text-lg">NEXUS<span className="text-[#888]">PBN</span></span>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-[#888] hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-medium bg-white text-black px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[#888] mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Nexus Edge Automation v2.0 is Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Build Unstoppable <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Edge Backlink Networks.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#888] max-w-2xl mx-auto mb-12">
            The world's first AI-driven, zero-footprint Static PBN automation platform. 
            Deploy serverless edge nodes, generate 1500+ word SEO-optimized content, and inject contextual backlinks on absolute autopilot.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-medium hover:bg-gray-200 transition-all">
              Start Deploying Links <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#171717] border border-[#262626] text-white px-8 py-4 rounded-full font-medium hover:bg-[#262626] transition-all">
              View Network Status
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to dominate search rankings.</h2>
            <p className="text-[#888]">No WordPress footprints. No manual writing. Just raw ranking power.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Server size={24} />}
              title="Static Edge Deployment"
              desc="Forget easily hackable WordPress sites. We deploy static, lightning-fast HTML directly to Vercel and GitHub, ensuring a 100/100 Google PageSpeed score."
            />
            <FeatureCard 
              icon={<LinkIcon size={24} />}
              title="Contextual Link Injection"
              desc="Simply provide your Money Site URL and Target Anchor Text. Our AI engine naturally embeds do-follow backlinks deep within massive 1500-word articles."
            />
            <FeatureCard 
              icon={<Shield size={24} />}
              title="Absolute Zero Footprint"
              desc="No shared IP blocks, no common themes, no database signatures. Pure static edge networks are impossible for Google to trace or penalize."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-[#888] text-sm">
        <p>&copy; 2026 NexusPBN Inc. Built specifically for elite SEOs and link builders.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl bg-[#0a0a0a] border border-[#262626] hover:border-[#404040] transition-colors group">
      <div className="w-12 h-12 rounded-full bg-[#171717] flex items-center justify-center mb-6 text-white border border-[#262626] group-hover:bg-blue-500/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-[#888] leading-relaxed">{desc}</p>
    </div>
  );
}
