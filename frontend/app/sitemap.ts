import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://dkodeera.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    const res = await fetch(`${apiUrl}/api/blogs`, { cache: 'no-store' });
    if (res.ok) {
      const blogs = await res.json();
      if (Array.isArray(blogs)) {
        blogUrls = blogs.map((blog: any) => ({
          url: `${baseUrl}/pages/blogs/${blog.slug}`,
          lastModified: new Date(blog.createdAt || Date.now()),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (e) {
    console.error('Error generating sitemap blog entries:', e);
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pages/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pages/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pages/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pages/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pages/careers`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  return [...staticPages, ...blogUrls];
}
