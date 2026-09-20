import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nexus-pbn.vercel.app';
  
  // List of programmatic SEO alternative pages
  const competitors = ['jasper-ai', 'wordai', 'wp-automatic', 'autoblogging-ai'];
  
  const alternatives = competitors.map((slug) => ({
    url: `${baseUrl}/alternatives/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/autoblogging-alternative`, // The one we manually built
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...alternatives,
  ];
}
