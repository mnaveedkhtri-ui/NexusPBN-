import { Metadata } from 'next';
import Link from 'next/link';

// Pre-render these specific competitor pages at build time on Vercel for maximum speed (KD 0 strategy)
export async function generateStaticParams() {
  return [
    { slug: 'jasper-ai' },
    { slug: 'wordai' },
    { slug: 'wp-automatic' },
    { slug: 'autoblogging-ai' },
  ];
}

type Props = {
  params: Promise<{ slug: string }>;
};

// Dynamically generate Meta Tags for each competitor page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const competitorName = resolvedParams.slug.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `Best ${competitorName} Alternative 2026 | Nexus PBN Deployer`,
    description: `Why pay for ${competitorName} when you can deploy automated AI sites for free? Discover why Nexus PBN Deployer is the top ${competitorName} alternative.`,
  };
}

export default async function ProgrammaticAlternativePage({ params }: Props) {
  const resolvedParams = await params;
  const competitorName = resolvedParams.slug.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Dynamic JSON-LD for AEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Nexus PBN Deployer',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': `The best free alternative to ${competitorName} for automated programmatic SEO.`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans selection:bg-blue-500/30">
        <header className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 text-white">
            The Ultimate <span className="text-blue-500">{competitorName} Alternative</span> for 2026
          </h1>
          <p className="text-xl text-[#a3a3a3] mb-10 max-w-3xl mx-auto leading-relaxed">
            Stop overpaying for {competitorName}. <strong>Nexus PBN Deployer</strong> uses the raw Gemini API to generate hyper-relevant content and deploys static Edge sites directly to Vercel and Cloudflare at zero monthly cost.
          </p>
          <Link href="/" className="inline-block bg-white text-black font-bold py-4 px-8 rounded-full shadow-lg hover:bg-gray-200 transition">
            Start Deploying for Free
          </Link>
        </header>

        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Nexus PBN vs. {competitorName}</h2>
          <div className="overflow-x-auto bg-[#111111] rounded-xl shadow-sm border border-[#333333]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1a1a1a] text-[#ededed]">
                  <th className="p-4 border-b border-[#333333]">Feature</th>
                  <th className="p-4 border-b border-[#333333] font-bold text-blue-500">Nexus PBN Deployer</th>
                  <th className="p-4 border-b border-[#333333]">{competitorName}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-[#222222] font-medium">Architecture</td>
                  <td className="p-4 border-b border-[#222222] font-bold text-green-500">Static Edge (Jamstack)</td>
                  <td className="p-4 border-b border-[#222222] text-[#888888]">Legacy/Slow</td>
                </tr>
                <tr className="bg-[#0f0f0f]">
                  <td className="p-4 border-b border-[#222222] font-medium">Content Quality</td>
                  <td className="p-4 border-b border-[#222222] font-bold text-green-500">Unfiltered Gemini API</td>
                  <td className="p-4 border-b border-[#222222] text-[#888888]">Highly Mark-uped Models</td>
                </tr>
                <tr>
                  <td className="p-4 border-b border-[#222222] font-medium">Subscription Cost</td>
                  <td className="p-4 border-b border-[#222222] font-bold text-green-500">$0 / month</td>
                  <td className="p-4 border-b border-[#222222] text-[#888888]">Expensive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
