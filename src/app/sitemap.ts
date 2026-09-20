import { MetadataRoute } from 'next';
import posts from '../data/posts.json';

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

  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
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
      url: `${baseUrl}/autoblogging-alternative`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogPosts,
    ...alternatives,
  ];
}
