import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Resource Center & Blog | Nexus PBN Deployer',
  description: 'Learn the latest 2026 SEO strategies, Generative Engine Optimization (GEO), and how to build footprint-free PBNs.',
};

export default function BlogIndex() {
  const posts = [
    {
      title: 'How to Build a Zero-Footprint PBN in 2026',
      slug: 'how-to-build-pbn-2026',
      excerpt: 'Learn how to use Edge networks, static generation, and the Gemini API to build a Private Blog Network that Google loves.',
      date: 'September 20, 2026',
    },
    {
      title: 'Generative Engine Optimization (GEO) Explained',
      slug: '#',
      excerpt: 'How to optimize your content so ChatGPT, Perplexity, and Gemini recommend your tools directly to users.',
      date: 'Coming Soon',
    }
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans">
      <header className="max-w-5xl mx-auto px-6 py-20 text-center border-b border-[#222]">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-white">
          SEO <span className="text-blue-500">Resource Center</span>
        </h1>
        <p className="text-xl text-[#a3a3a3] max-w-2xl mx-auto">
          Advanced strategies for modern link building, programmatic SEO, and AI automation.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid gap-8">
          {posts.map((post, idx) => (
            <article key={idx} className="bg-[#111] p-8 rounded-2xl border border-[#333] hover:border-[#555] transition">
              <span className="text-sm font-semibold text-blue-500 mb-2 block">{post.date}</span>
              <h2 className="text-2xl font-bold text-white mb-4">
                {post.slug !== '#' ? (
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                ) : (
                  <span>{post.title}</span>
                )}
              </h2>
              <p className="text-[#a3a3a3] mb-6 leading-relaxed">{post.excerpt}</p>
              {post.slug !== '#' && (
                <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-white font-medium hover:text-blue-400 transition">
                  Read Full Guide →
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
