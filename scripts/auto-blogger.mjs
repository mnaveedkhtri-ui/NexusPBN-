import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env explicitly
const envPath = path.resolve(__dirname, '../.env.local');
const envData = await fs.readFile(envPath, 'utf-8');
const apiKeyMatch = envData.match(/GEMINI_API_KEY=(.*)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim().replace(/["']/g, '') : null;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

const TOPICS = [
  "Vercel vs Cloudflare for SEO Sites",
  "Why Traditional Article Spinners are Dead in 2026",
  "Programmatic SEO Guide for Affiliate Marketers",
  "Generative Engine Optimization (GEO) Explained",
  "How to avoid Google's Helpful Content Update Penalties"
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function generateBlog() {
  const topic = pickRandom(TOPICS);
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  console.log(`🤖 Generating SEO Blog for topic: "${topic}"...`);

  const prompt = `
    You are an elite Technical SEO and Next.js expert.
    Write a highly optimized blog post about "${topic}".
    The target website is "Nexus PBN Deployer", a tool that automates Jamstack/Vercel PBNs using Gemini AI.
    
    Requirements:
    1. Output MUST be ONLY valid React (Next.js App Router) TSX code. NO markdown formatting blocks like \`\`\`tsx. Just the raw code.
    2. Include 3 internal links to '/' and '/autoblogging-alternative'.
    3. Include 1 external link to an authoritative site (like Google Search Central or Ahrefs).
    4. Use semantic HTML (article, section, h2, h3).
    5. Include an Article JSON-LD Schema.
    6. Include an image from Bing using: <img src="https://tse1.mm.bing.net/th?q=${encodeURIComponent(topic)}" alt="${topic}" className="w-full rounded-xl my-8 object-cover max-h-96" />
    7. Length: ~800+ words. Deep, technical, LSI optimized.
    8. Use Tailwind dark mode classes (bg-[#0a0a0a], text-[#ededed], etc).
    
    Export default function BlogPost() { ... }
    Include the metadata export.
  `;

  let res, data;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } })
    });
    data = await res.json();
    if (data.error && data.error.code === 503) throw new Error("503");
  } catch (e) {
    console.log("⚠️ gemini-3.6-flash is busy, falling back to gemini-flash-latest...");
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } })
    });
    data = await res.json();
  }

  if (!data.candidates) {
    console.error("❌ API Error:", data);
    return;
  }
  
  let rawCode = data.candidates[0].content.parts[0].text;
  rawCode = rawCode.replace(/```tsx/g, '').replace(/```typescript/g, '').replace(/```/g, '').trim();

  // Create Directory
  const blogDir = path.resolve(__dirname, `../src/app/blog/${slug}`);
  await fs.mkdir(blogDir, { recursive: true });
  
  // Write page.tsx
  await fs.writeFile(path.join(blogDir, 'page.tsx'), rawCode, 'utf-8');
  
  // Update posts.json
  const postsPath = path.resolve(__dirname, '../src/data/posts.json');
  const postsData = JSON.parse(await fs.readFile(postsPath, 'utf-8'));
  
  postsData.unshift({
    title: topic,
    slug,
    excerpt: `Discover the ultimate guide to ${topic} and how to dominate search rankings in 2026.`,
    date: dateStr
  });
  
  await fs.writeFile(postsPath, JSON.stringify(postsData, null, 2), 'utf-8');

  console.log(`✅ Successfully generated and saved to /blog/${slug}`);
}

generateBlog().catch(console.error);
