import { NextResponse } from 'next/server';
import sql, { initDB } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { marked } from 'marked';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const maxDuration = 60; // Allow Vercel to run up to 60 seconds

// Helper function to generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper function to wait
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userEmail = session.user.email;

    const { domain, niche = 'general', provider, moneyUrl = '#', anchorText = 'Click Here', targetKeyword = '' } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    await initDB();
    const keysRes = await sql`SELECT * FROM api_keys WHERE user_email = ${userEmail} LIMIT 1`;
    if (keysRes.rows.length === 0) return NextResponse.json({ error: "API Keys not configured. Please save them in Settings." }, { status: 400 });
    
    const userKeys = keysRes.rows[0];
    const GEMINI_API_KEY = userKeys.gemini_key;
    const GITHUB_TOKEN = userKeys.github_token;
    const VERCEL_TOKEN = userKeys.vercel_token;
    const CLOUDFLARE_TOKEN = userKeys.cloudflare_token;
    const CLOUDFLARE_ACCOUNT_ID = userKeys.cloudflare_account_id;
    
    // We don't have team IDs yet, assume empty or null
    const VERCEL_TEAM_ID = '';

    if (!GEMINI_API_KEY || !GITHUB_TOKEN || !VERCEL_TOKEN) {
      return NextResponse.json({ error: 'Missing required API keys in Settings. (Gemini, GitHub, Vercel)' }, { status: 400 });
    }

    // Clean up domain and add professional SEO suffixes instead of spammy numbers
    const cleanDomain = domain.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const suffixes = ['hq', 'daily', 'insights', 'hub', 'blog', 'news', 'update', 'pro', 'guide'];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const uniqueId = Math.random().toString(36).substring(2, 7);
    const repoName = `${cleanDomain}-${randomSuffix}-${uniqueId}`;

    // Fetch AI Persona Settings
    let aiTone = 'Authoritative & Professional';
    let aiCustomPrompt = '';
    try {
      const dbRes = await sql`SELECT tone, custom_prompt FROM ai_settings WHERE user_email = ${userEmail} LIMIT 1`;
      if (dbRes.rows.length > 0) {
        aiTone = dbRes.rows[0].tone || aiTone;
        aiCustomPrompt = dbRes.rows[0].custom_prompt || '';
      }
    } catch (err) {
      console.log('Could not fetch AI Settings:', err);
    }

    // 1. ZIDDI ENGINE - GENERATE CONTENT (Gemini Flash with 3 Retries)
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    
    let prompt = `Write a massive, 1200+ word highly SEO-optimized, engaging, and professional blog post for a website about "${niche}".
    Format the response strictly in Markdown. 
    Follow this exact structure:
    1. Start directly with an engaging introductory paragraph. Do not include a main H1 title at the top (I will add it).
    2. Include a "In short:" summary line.
    3. Include a "Key Takeaways" section with bullet points.
    4. Use multiple H2 and H3 subheadings for sections.
    5. Include a well-formatted Markdown Table comparing data relevant to the ${niche} niche (e.g., pricing, features, pros/cons). Ensure the table uses standard markdown pipe format.
    6. Include a "Conclusion" H2 section summarizing the article.
    7. End with a "Frequently Asked Questions" H2 section containing 4 common Q&A about ${niche}.
    
    Crucially: Include a natural contextual backlink in the middle of the article using the exact anchor text "[${anchorText}](${moneyUrl})".
    
    Also, embed exactly 2 high-quality images inside the body of the article using these exact markdown tags:
    ![${niche} Image 1](https://loremflickr.com/1600/900/${encodeURIComponent(niche).replace(/%20/g, ',')},business/all?random=1)
    ![${niche} Image 2](https://loremflickr.com/1600/900/${encodeURIComponent(niche).replace(/%20/g, ',')},business/all?random=2)
    
    CRITICAL SEO REQUIREMENT: Make the tone 1000% natural and human. Do NOT use em-dashes or en-dashes anywhere. Avoid typical AI buzzwords like delve, realm, tapestry.
    
    TONE OF VOICE: ${aiTone}`;
    
    if (aiCustomPrompt.trim()) {
      prompt += `\n\nADDITIONAL RULES TO STRICTLY FOLLOW:\n${aiCustomPrompt}`;
    }

    let markdownContent = '';
    let success = false;

    // Retry Logic: Try up to 3 times
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (request.signal.aborted) throw new Error('Deployment canceled by user');
        console.log(`Gemini Attempt ${attempt}...`);
        const result = await model.generateContent(prompt);
        markdownContent = result.response.text();
        
        success = true;
        console.log(`Gemini succeeded on attempt ${attempt}!`);
        break; // Exit loop if successful
      } catch (e: any) {
        console.log(`Attempt ${attempt} failed:`, e.message);
        if (attempt < 3) {
          await delay(2000); // Wait 2 seconds before retrying
        }
      }
    }

    // MASSIVE FALLBACK if all 3 retries fail
    if (!success) {
      console.log("All 3 attempts failed. Using massive fallback.");
      markdownContent = `## The Future of Digital Infrastructure and Automation
      
Building a reliable online presence takes more than just buying a domain. You need speed, security, and a system that works around the clock without constant maintenance. As technology evolves, smart website owners are moving away from heavy content management systems and adopting streamlined cloud solutions. 

The goal is simple. You want your content to load instantly for users across the globe while keeping server costs low. But reaching that goal requires a deep understanding of modern web architecture and automated deployment strategies.

![Modern Technology](https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&h=900&auto=format&fit=crop)

### Why Modern Cloud Hosting Wins

Search engines heavily prioritize website speed and user experience. If your pages take too long to load, visitors bounce back to the search results, and your rankings drop. This is why edge networks have become the industry standard. 

If you want to truly scale, utilizing the [${anchorText}](${moneyUrl}) is a practical strategy that provides the backbone needed for high-frequency updates and rock-solid reliability. By distributing your files across hundreds of global nodes, you ensure that every user gets the fastest possible response time.

### The Shift Away From Traditional Databases

For years, the standard approach was to use massive SQL databases and heavy backend frameworks. Today, the approach has fundamentally shifted. Static site generators take your content, compile it into lightning-fast HTML pages, and serve it directly from a CDN. 

1. **Unmatched Security:** There is no database to hack. 
2. **Infinite Scalability:** A static page can handle 10 visitors or 10 million visitors with the exact same architecture.
3. **Cheaper Hosting:** Serving raw files costs a fraction of keeping dedicated servers running 24/7.

![Business Growth](https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600&h=900&auto=format&fit=crop)

### Frequently Asked Questions

**Q: Is edge hosting expensive?**
Not at all. In fact, many edge providers offer extremely generous free tiers that can handle substantial monthly traffic.

**Q: How fast can new content be deployed?**
With modern deployment engines, a fully functional update can go live globally in under 30 seconds. This allows for rapid iteration and real-time content updates without taking the site offline.

**Q: Do I need to be a developer to use edge networks?**
While some technical knowledge helps, modern platforms have simplified the deployment process to simple Git pushes. If you can use version control, you can host on the edge.

### Final Thoughts

The tools required to build a highly profitable digital empire are accessible to everyone. By integrating automated workflows, version control, and reliable edge hosting, you can focus on publishing great content instead of fixing server errors. Start upgrading your infrastructure today and watch your traffic grow naturally.`;
    }

    // Convert Markdown to HTML
    const htmlArticleContent = await marked(markdownContent);
    
    const formattedNiche = niche.charAt(0).toUpperCase() + niche.slice(1);
    // 2. CREATE GITHUB REPOSITORY
    if (request.signal.aborted) throw new Error('Deployment canceled by user before GitHub');
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: repoName,
        private: true,
        auto_init: true
      })
    });
    const repoData = await createRepoRes.json();
    if (!createRepoRes.ok) {
      throw new Error('GitHub Repo Creation Failed: ' + JSON.stringify(repoData));
    }
    const githubUsername = repoData.owner.login;

    // 3. CREATE EDGE DEPLOYMENT (Vercel or Cloudflare)
    if (request.signal.aborted) throw new Error('Deployment canceled by user before Edge Provider');
    
    let finalEdgeUrl = '';
    
    if (provider === 'cloudflare') {
      if (!CLOUDFLARE_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
        throw new Error('Cloudflare keys are missing in Workspace Settings!');
      }
      const createCfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repoName,
          source: { type: 'github', config: { owner: githubUsername, repo_name: repoName, production_branch: 'main' } },
          build_config: { build_command: '', destination_dir: '', root_dir: '' }
        })
      });
      const cfData = await createCfRes.json();
      if (!cfData.success) throw new Error('Cloudflare API Error: ' + JSON.stringify(cfData.errors));
      
      finalEdgeUrl = `https://${cfData.result.subdomain}`;
      
      // Wait for Cloudflare to link repo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } else {
      // DEFAULT: VERCEL
      const createVercelRes = await fetch('https://api.vercel.com/v9/projects', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repoName,
          framework: null,
          gitRepository: { repo: repoData.full_name, type: 'github' }
        })
      });

      const vercelData = await createVercelRes.json();
      if (!createVercelRes.ok) {
        throw new Error('Vercel Project Creation Failed: ' + JSON.stringify(vercelData));
      }

      // Wait 2 seconds for Vercel to fully link the repo
      await new Promise(resolve => setTimeout(resolve, 2000));

      finalEdgeUrl = `https://${repoName}.vercel.app`;
      if (domain.includes('.')) {
        try {
          const domainRes = await fetch(`https://api.vercel.com/v9/projects/${repoName}/domains`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: domain })
          });
          if (domainRes.ok) finalEdgeUrl = `https://${domain}`;
        } catch (err) {}
      }
    }

    // 4. GENERATE HTML TEMPLATE WITH EMBEDDED AI CONTENT & FIX TAILWIND LINKS
    
    // --- AI CONTENT ENGINE ---
    const primaryKeyword = targetKeyword.trim() ? targetKeyword : anchorText;
    let articleTitle = primaryKeyword.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    


    let finalArticleHtml = `<article class="prose prose-slate max-w-none">
            <div class="flex items-center gap-4 mb-8">
              <span class="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full">${formattedNiche}</span>
              <span class="text-slate-500 text-sm font-medium">5 min read</span>
            </div>
            <h1 class="text-4xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">${articleTitle}</h1>
            <p class="text-xl text-slate-600 mb-8 leading-relaxed font-medium">Comprehensive insights and complete guide on ${primaryKeyword}.</p>
            ${htmlArticleContent}
          </article>`;
    
    // SEO STRICT LIMITS: Title under 70 chars, Meta Description under 155 chars
    let seoTitle = articleTitle;
    if (seoTitle.length > 65) {
      seoTitle = seoTitle.substring(0, 62).trim() + '...';
    }
    const blogTitle = seoTitle;
    
    let metaDesc = `Comprehensive insights and complete guide on ${primaryKeyword}. Learn the best strategies today.`;
    if (metaDesc.length > 150) {
      metaDesc = metaDesc.substring(0, 147).trim() + '...';
    }

    const imageUrl = `https://loremflickr.com/1600/900/${encodeURIComponent(niche).replace(/%20/g, ',')},business/all?random=3`;

    // -------------------------

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": finalEdgeUrl
      },
      "headline": seoTitle,
      "image": imageUrl,
      "author": { "@type": "Organization", "name": "Nexus PBN Network" },
      "publisher": {
        "@type": "Organization",
        "name": "Nexus PBN Network",
        "logo": { "@type": "ImageObject", "url": imageUrl }
      },
      "datePublished": new Date().toISOString()
    };

    const htmlFileContent = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${metaDesc}">
    <title>${blogTitle}</title>
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@300;400;700&display=swap');
    
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #334155; }
    .article-body { font-family: 'Merriweather', serif; font-size: 1.125rem; line-height: 1.8; color: #1e293b; }
    
    /* Premium Links */
    .pbn-content a { color: #2563eb !important; font-weight: 600 !important; text-decoration-color: #93c5fd !important; text-decoration-thickness: 2px !important; text-underline-offset: 4px !important; transition: all 0.2s ease; }
    .pbn-content a:hover { color: #1d4ed8 !important; text-decoration-color: #2563eb !important; background-color: #eff6ff; }
    
    /* Images */
    .pbn-content img { border-radius: 0.5rem; margin: 2.5rem 0; width: 100%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    
    /* Headings */
    .pbn-content h2, .pbn-content h3 { font-family: 'Inter', sans-serif; color: #0f172a; font-weight: 700; margin-top: 3rem; margin-bottom: 1.25rem; letter-spacing: -0.025em; }
    .pbn-content h2 { font-size: 1.875rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    .pbn-content h3 { font-size: 1.5rem; }
    
    /* Lists and Text */
    .pbn-content p { margin-bottom: 1.5rem; }
    .pbn-content ul { margin-bottom: 1.5rem; padding-left: 1.5rem; list-style-type: none; }
    .pbn-content ul li { position: relative; margin-bottom: 0.5rem; padding-left: 1.5rem; }
    .pbn-content ul li::before { content: '•'; color: #3b82f6; font-weight: bold; font-size: 1.5rem; position: absolute; left: 0; top: -5px; }
    .pbn-content strong { color: #0f172a; font-weight: 700; }
    
    /* Premium Tables */
    .pbn-content table { width: 100%; border-collapse: collapse; margin: 2.5rem 0; background-color: #ffffff; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
    .pbn-content th, .pbn-content td { padding: 1rem 1.25rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .pbn-content th { background-color: #f8fafc; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .pbn-content tr:hover td { background-color: #f1f5f9; }
  </style>
</head>
<body class="antialiased selection:bg-blue-200 selection:text-blue-900">
  
  <!-- Top Bar -->
  <div class="bg-slate-900 text-slate-300 py-1.5 text-xs font-medium tracking-wide text-center">
    Join our premium newsletter for exclusive weekly updates. <a href="#" class="text-white underline hover:text-blue-300 ml-2">Subscribe Now</a>
  </div>

  <!-- Main Navigation -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
          ${domain.charAt(0).toUpperCase()}
        </div>
        <span class="text-2xl font-extrabold tracking-tight text-slate-900">${domain.split('.')[0]}<span class="text-blue-600">.</span></span>
      </a>
      
      <!-- Nav Links -->
      <nav class="hidden md:flex space-x-8 text-sm font-semibold text-slate-600">
        <a href="#" class="text-blue-600">Home</a>
        <a href="#" class="hover:text-slate-900 transition-colors">Categories</a>
        <a href="#" class="hover:text-slate-900 transition-colors">Latest News</a>
        <a href="#" class="hover:text-slate-900 transition-colors">Editorial</a>
        <a href="#" class="hover:text-slate-900 transition-colors">About Us</a>
      </nav>

      <!-- Search & Action -->
      <div class="flex items-center gap-4">
        <button class="text-slate-400 hover:text-slate-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </button>
        <a href="#" class="hidden sm:inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
          Get in Touch
        </a>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
      
      <!-- Main Content Area -->
      <div class="lg:col-span-8">
        <!-- Breadcrumbs -->
        <nav class="flex text-sm text-slate-500 mb-6 font-medium" aria-label="Breadcrumb">
          <a href="#" class="hover:text-blue-600">Home</a>
          <span class="mx-2">/</span>
          <a href="#" class="hover:text-blue-600">Editorial</a>
          <span class="mx-2">/</span>
          <span class="text-slate-900">Article</span>
        </nav>

        <article>
          <!-- Article Header -->
          <header class="mb-10">
            <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              ${articleTitle}
            </h1>
            
            <div class="flex items-center justify-between py-4 border-y border-slate-200 mb-8">
              <div class="flex items-center gap-4">
                <img src="https://i.pravatar.cc/150?u=${domain}" alt="Author" class="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                <div>
                  <p class="text-sm font-bold text-slate-900">Sarah Jenkins</p>
                  <p class="text-xs text-slate-500 font-medium">Senior Editor &bull; ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg></button>
                <button class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></button>
              </div>
            </div>
          </header>

          <!-- Featured Image -->
          <div class="mb-10 rounded-2xl overflow-hidden shadow-lg border border-slate-200 group relative">
            <img src="${imageUrl}" alt="${blogTitle}" class="w-full h-[450px] object-cover transition duration-1000 group-hover:scale-105" />
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-20">
              <span class="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-md">Featured</span>
            </div>
          </div>

          <!-- Article Content (Merriweather) -->
          <div class="article-body pbn-content">
            ${finalArticleHtml}
          </div>
        </article>
        
        <!-- Tags & Share -->
        <div class="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex gap-2">
            <span class="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-200 cursor-pointer">${formattedNiche}</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-200 cursor-pointer">Trends</span>
            <span class="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full hover:bg-slate-200 cursor-pointer">Insights</span>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <aside class="lg:col-span-4 space-y-10">
        
        <!-- About Author Widget -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">About the Author</h3>
          <div class="flex gap-4 items-start">
            <img src="https://i.pravatar.cc/150?u=${domain}" alt="Author" class="w-16 h-16 rounded-full object-cover" />
            <div>
              <h4 class="font-bold text-slate-900">Sarah Jenkins</h4>
              <p class="text-sm text-slate-500 mt-1 mb-3">Award-winning industry analyst and senior editor covering the latest developments in ${formattedNiche}.</p>
              <a href="#" class="text-sm font-bold text-blue-600 hover:underline">Read full bio &rarr;</a>
            </div>
          </div>
        </div>

        <!-- Newsletter Widget -->
        <div class="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div class="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
          <h3 class="text-xl font-bold mb-2 relative z-10">The Weekly Briefing</h3>
          <p class="text-slate-400 text-sm mb-6 relative z-10">Get the most important insights and deep-dives delivered straight to your inbox.</p>
          <form class="relative z-10" onsubmit="event.preventDefault()">
            <input type="email" placeholder="Your email address..." class="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 mb-3" />
            <button class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">Subscribe Now</button>
          </form>
          <p class="text-xs text-slate-500 mt-4 text-center">No spam. Unsubscribe anytime.</p>
        </div>

        <!-- Trending Posts -->
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Trending Now</h3>
          <ul class="space-y-4">
            <li class="flex gap-4 group cursor-pointer">
              <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=200&h=200&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">The Future of Remote Work and Global Markets in 2027</h4>
                <span class="text-xs text-slate-500">Oct 12, 2026</span>
              </div>
            </li>
            <li class="flex gap-4 group cursor-pointer">
              <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=200&h=200&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">How AI is Reshaping the Modern Economy</h4>
                <span class="text-xs text-slate-500">Oct 10, 2026</span>
              </div>
            </li>
            <li class="flex gap-4 group cursor-pointer">
              <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1432821596592-e2c18b78144f?q=80&w=200&h=200&auto=format&fit=crop" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div>
                <h4 class="font-bold text-slate-900 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">10 Essential Strategies for Maximum Growth</h4>
                <span class="text-xs text-slate-500">Oct 05, 2026</span>
              </div>
            </li>
          </ul>
        </div>

      </aside>
    </div>
  </main>

  <!-- Footer -->
  <footer class="bg-slate-900 text-slate-400 py-12 mt-10 border-t border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div class="col-span-1 md:col-span-2">
          <a href="/" class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">${domain.charAt(0).toUpperCase()}</div>
            <span class="text-xl font-extrabold text-white tracking-tight">${domain.split('.')[0]}<span class="text-blue-500">.</span></span>
          </a>
          <p class="text-sm leading-relaxed max-w-sm">Delivering the highest quality editorial content, deep insights, and industry analysis to help you stay ahead of the curve.</p>
        </div>
        <div>
          <h4 class="text-white font-bold mb-4 uppercase text-sm tracking-wider">Company</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white transition">About Us</a></li>
            <li><a href="#" class="hover:text-white transition">Careers</a></li>
            <li><a href="#" class="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" class="hover:text-white transition">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 class="text-white font-bold mb-4 uppercase text-sm tracking-wider">Connect</h4>
          <ul class="space-y-2 text-sm">
            <li><a href="#" class="hover:text-white transition">Twitter</a></li>
            <li><a href="#" class="hover:text-white transition">LinkedIn</a></li>
            <li><a href="#" class="hover:text-white transition">Facebook</a></li>
            <li><a href="#" class="hover:text-white transition">Contact Support</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <p>&copy; ${new Date().getFullYear()} ${domain}. All rights reserved.</p>
        <p>Published on the Nexus Global Network.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
// Encode file to Base64 for GitHub API
    const contentEncoded = Buffer.from(htmlFileContent).toString('base64');

    // Wait 2 seconds for Vercel webhooks to attach to GitHub
    await new Promise(r => setTimeout(r, 2000));

    if (request.signal.aborted) throw new Error('Deployment canceled by user before Push');

    // 5b. PUSH ROBOTS.TXT
    const robotsContent = `User-agent: *
Allow: /
Sitemap: ${finalEdgeUrl}/sitemap.xml`;

    // 5c. PUSH SITEMAP.XML
    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${finalEdgeUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    // 5. PUSH FILE TO GITHUB (This will trigger Vercel to build!)
    await fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/index.html`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Initial PBN deployment from Nexus',
        content: contentEncoded,
      }),
    });

    // Wait 1 second to avoid GitHub Git Tree lock issues
    await new Promise(r => setTimeout(r, 1000));

    // 5b. PUSH ROBOTS.TXT
    await fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/robots.txt`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Add robots.txt',
        content: Buffer.from(robotsContent).toString('base64'),
      }),
    });

    // Wait 1 second
    await new Promise(r => setTimeout(r, 1000));

    // 5c. PUSH SITEMAP.XML
    await fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/sitemap.xml`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Add sitemap.xml',
        content: Buffer.from(sitemapContent).toString('base64'),
      }),
    });

    // 4. Save to Database
    const projectId = generateId();
    try { await initDB(); } catch(e) {}
    
    await sql`
      INSERT INTO projects (id, user_email, domain, moneyUrl, anchorText, vercelUrl, githubRepo) 
      VALUES (${projectId}, ${userEmail}, ${domain}, ${moneyUrl}, ${anchorText}, ${finalEdgeUrl}, ${repoName})
    `;

    return NextResponse.json({ 
      success: true, 
      id: projectId,
      domain: domain,
      repo: repoName,
      status: 'live'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

