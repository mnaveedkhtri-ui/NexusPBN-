import Link from 'next/link';
import { Metadata } from 'next';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import posts from '../../data/posts.json';

export const metadata: Metadata = {
  title: 'SEO Resource Center & Blog | Nexus PBN Deployer',
  description: 'Learn the latest 2026 SEO strategies, Generative Engine Optimization (GEO), and how to build footprint-free PBNs.',
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#ededed] font-sans selection:bg-blue-500/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <header className="relative max-w-5xl mx-auto px-6 pt-32 pb-20 text-center z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
          <BookOpen size={16} />
          <span>Nexus Knowledge Base</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-400">
          SEO Resource Center
        </h1>
        <p className="text-xl text-[#a3a3a3] max-w-2xl mx-auto leading-relaxed">
          Dominate the SERPs with advanced strategies for modern link building, programmatic SEO, and AI automation.
        </p>
      </header>

      <section className="relative max-w-6xl mx-auto px-6 py-10 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <article 
              key={idx} 
              className="group relative bg-[#0a0a0a]/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:border-blue-500/30 hover:bg-[#111]/80 transition-all duration-500 flex flex-col justify-between overflow-hidden"
            >
              {/* Card Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-4 tracking-wider uppercase">
                  <Calendar size={14} />
                  <span>{post.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 leading-snug group-hover:text-blue-50 transition-colors">
                  {post.slug !== '#' ? (
                    <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-20">
                      <span className="sr-only">Read {post.title}</span>
                    </Link>
                  ) : null}
                  {post.title}
                </h2>
                <p className="text-[#888] leading-relaxed mb-8 line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="relative z-10 flex items-center text-blue-500 font-medium group-hover:text-blue-400 transition-colors">
                <span className="mr-2">Read Full Guide</span>
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
