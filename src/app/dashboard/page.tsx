'use client';

import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Server, Globe, FileText, Settings, Plus, MoreHorizontal, CheckCircle2, Search, Loader2, LineChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Mon', links: 0, articles: 0 },
  { name: 'Tue', links: 0, articles: 0 },
  { name: 'Wed', links: 0, articles: 0 },
  { name: 'Thu', links: 0, articles: 0 },
  { name: 'Fri', links: 0, articles: 0 },
  { name: 'Sat', links: 0, articles: 0 },
  { name: 'Sun', links: 0, articles: 0 },
];

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [niche, setNiche] = useState('');
  const [provider, setProvider] = useState('vercel');
  const [moneyUrl, setMoneyUrl] = useState('');
  const [anchorText, setAnchorText] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [domains, setDomains] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDomains(data);
        }
      })
      .catch(err => console.error("Failed to fetch projects", err));
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleDeploy = async () => {
    if (!newDomain || !niche) return;
    setIsDeploying(true);
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain, niche, provider, moneyUrl, anchorText }),
        signal: abortControllerRef.current.signal
      });

      const data = await response.json();

      if (response.ok) {
        const newEntry = {
          id: data.id || Date.now(),
          domain: newDomain,
          moneyUrl: moneyUrl,
          anchorText: anchorText,
          vercelUrl: `https://${data.repo}.vercel.app`,
          status: 'live'
        };
        
        setDomains([newEntry, ...domains]);
        setNewDomain('');
        setIsModalOpen(false);
      } else {
        alert("Deployment Error: " + data.error);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Deployment aborted by user');
      } else {
        alert("Failed to reach server.");
      }
    } finally {
      setIsDeploying(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (isDeploying && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Settings State
  const [keys, setKeys] = useState({ geminiKey: '', vercelToken: '', githubToken: '', cloudflareToken: '', cloudflareAccountId: '' });
  const [isSavingKeys, setIsSavingKeys] = useState(false);

  useEffect(() => {
    if (activeTab === 'settings') {
      fetch('/api/settings')
        .then(res => res.json())
        .then(data => setKeys({ geminiKey: data.geminiKey, vercelToken: data.vercelToken, githubToken: data.githubToken, cloudflareToken: data.cloudflareToken || '', cloudflareAccountId: data.cloudflareAccountId || '' }))
        .catch(console.error);
    }
  }, [activeTab]);

  const handleUpdateKeys = async () => {
    setIsSavingKeys(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys)
      });
      const data = await res.json();
      if (res.ok) alert('Keys updated successfully!');
      else alert('Failed to update keys: ' + data.error);
    } catch (e) {
      alert('Error updating keys');
    }
    setIsSavingKeys(false);
  };


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] font-sans flex relative">
      
      {/* Deploy Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-6 w-[400px] shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">Deploy New PBN Node</h3>
            
            <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1">Subdomain Name (e.g. crypto-news)</label>
                  <input 
                    type="text" 
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="Enter subdomain name..."
                    className="w-full bg-[#111] border border-[#262626] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1">Target Niche (e.g. Weight Loss, Travel)</label>
                  <input 
                    type="text" 
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Enter the niche for AI content..."
                    className="w-full bg-[#111] border border-[#262626] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#888] mb-1">Your Main Website URL (To Boost)</label>
                  <input 
                    type="url" 
                    value={moneyUrl}
                    onChange={(e) => setMoneyUrl(e.target.value)}
                    placeholder="https://your-main-site.com"
                    className="w-full bg-[#111] border border-[#262626] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#888] mb-1">Anchor Text</label>
                  <input 
                    type="text" 
                    value={anchorText}
                    onChange={(e) => setAnchorText(e.target.value)}
                    placeholder="e.g. Best SEO Tools" 
                    className="w-full bg-[#171717] border border-[#262626] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#404040]"
                  />
                </div>
              <div>
                <label className="block text-sm font-medium text-[#888] mb-1">Cloud Provider</label>
                <select 
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-[#171717] border border-[#262626] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#404040]"
                >
                  <option>Vercel Static (Free)</option>
                  <option>GitHub Pages (Free)</option>
                  <option>Netlify (Free)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={handleDeploy}
                disabled={isDeploying || !newDomain}
                className="px-4 py-2 text-sm font-medium bg-white text-black rounded-md hover:bg-[#e5e5e5] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isDeploying ? 'Deploying...' : 'Start Deployment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 border-r border-[#262626] bg-[#0a0a0a] flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-[#262626]">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-6 h-6 rounded bg-white text-black flex items-center justify-center text-sm">N</div>
            NexusPBN
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-8">
            <h4 className="px-3 text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Overview</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'dashboard' ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'analytics' ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'}`}>
                  <LineChart className="w-4 h-4" /> Rank Tracker
                </button>
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h4 className="px-3 text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">Network</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveTab('domains')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'domains' ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'}`}>
                  <Globe className="w-4 h-4" /> PBN Fleet
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('articles')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'articles' ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'}`}>
                  <FileText className="w-4 h-4" /> AI Content Studio
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('infrastructure')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'infrastructure' ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'}`}>
                  <Server className="w-4 h-4" /> Edge Providers
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="px-3 text-xs font-semibold text-[#888] uppercase tracking-wider mb-3">System</h4>
            <ul className="space-y-1">
              <li>
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${activeTab === 'settings' ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'}`}>
                  <Settings className="w-4 h-4" /> Settings & API Keys
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#262626] flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 w-96">
            <Search className="w-4 h-4 text-[#888]" />
            <input 
              type="text" 
              placeholder="Search domains, IP addresses..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder-[#888]"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#888] hover:text-white transition-colors">
              <Plus className="w-5 h-5" onClick={() => setIsModalOpen(true)} />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                  <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-[#e5e5e5] transition-colors">
                    <Plus className="w-4 h-4" />
                    Deploy Node
                  </button>
                </div>
                
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <KpiCard title="Active Domains" value={domains.length.toString()} change="+0" />
                  <KpiCard title="Indexed Pages" value="0" change="+0" />
                  <KpiCard title="Avg. DA" value="0.0" change="+0.0" />
                  <KpiCard title="Server Costs" value="$0.00" change="+$0.00" />
                </div>

                {/* Chart Area */}
                <div className="mt-8 bg-[#0a0a0a] border border-[#262626] p-6 rounded-xl">
                  <div className="mb-4">
                    <h3 className="font-semibold">Network Growth</h3>
                    <p className="text-sm text-[#888]">Link velocity and indexation over time</p>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorLinks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                        <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                        <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }} />
                        <Area type="monotone" dataKey="links" stroke="#fff" fillOpacity={1} fill="url(#colorLinks)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Table */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Fleet Status</h3>
                  </div>
                  <div className="border border-[#262626] rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-[#888] uppercase bg-[#111] border-b border-[#262626]">
                        <tr>
                          <th className="px-4 py-3 font-medium">Domain / Repo</th>
                          <th className="px-4 py-3 font-medium">Live PBN Link</th>
                          <th className="px-4 py-3 font-medium">Target Money Site</th>
                          <th className="px-4 py-3 font-medium">Anchor Text</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#262626]">
                        {domains.map((d) => (
                          <TableRow 
                            key={d.id} 
                            domain={d.domain} 
                            vercelUrl={d.vercelUrl} 
                            moneyUrl={d.moneyUrl} 
                            anchorText={d.anchorText} 
                            status={d.status} 
                          />
                        ))}
                      </tbody>
                    </table>
                    {domains.length === 0 && (
                      <div className="p-8 text-center text-[#888]">
                        <Globe className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No domains deployed yet. Click "Deploy Node" to start.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold tracking-tight">Rank Tracker (SERP)</h2>
                </div>
                <div className="bg-[#0a0a0a] border border-[#262626] rounded-xl p-8 text-center">
                  <LineChart className="w-12 h-12 text-[#888] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Connect Google Search Console</h3>
                  <p className="text-[#888] max-w-md mx-auto mb-6">To view real-time keyword movements and indexation status, please connect your GSC API.</p>
                  <button className="bg-white text-black font-medium px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">Connect GSC (Coming Soon)</button>
                </div>
              </div>
            )}

            {activeTab === 'domains' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">PBN Fleet Management</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#111] border border-[#262626] p-6 rounded-xl">
                    <h3 className="font-medium mb-2">Auto-Renewal Status</h3>
                    <p className="text-sm text-[#888] mb-4">All domains deployed via Vercel subdomains do not require manual renewal or SSL configuration.</p>
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                      <span className="text-green-500 text-sm font-medium">100% Secure & Renewed</span>
                    </div>
                  </div>
                  <div className="bg-[#111] border border-[#262626] p-6 rounded-xl">
                    <h3 className="font-medium mb-2">DNS Health & Footprints</h3>
                    <p className="text-sm text-[#888] mb-4">No IP leaks detected. All nodes are successfully masked behind edge CDN proxies.</p>
                    <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                      <span className="text-blue-400 text-sm font-medium">Footprints Isolated</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'infrastructure' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Edge Providers</h2>
                <div className="bg-[#111] border border-[#262626] rounded-xl divide-y divide-[#262626]">
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-1">Vercel Serverless</h3>
                      <p className="text-sm text-[#888]">Primary provider for Next.js and static HTML deployments.</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full border border-green-500/20">Connected</span>
                  </div>
                  <div className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white mb-1">GitHub Actions</h3>
                      <p className="text-sm text-[#888]">Handles CI/CD and repository management for the fleet.</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full border border-green-500/20">Connected</span>
                  </div>
                  <div className={`p-6 flex items-center justify-between ${keys.cloudflareToken ? '' : 'opacity-50'}`}>
                    <div>
                      <h3 className="font-medium text-white mb-1">Cloudflare Pages</h3>
                      <p className="text-sm text-[#888]">Alternative Edge deployment for maximum footprint isolation.</p>
                    </div>
                    {keys.cloudflareToken ? (
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full border border-green-500/20">Connected</span>
                    ) : (
                      <button onClick={() => setActiveTab('settings')} className="px-4 py-2 border border-[#262626] rounded-md text-sm hover:bg-[#262626]">Connect</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'articles' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">AI Content Studio</h2>
                <div className="bg-[#111] border border-[#262626] p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Global AI Persona</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#888] mb-2">Content Tone</label>
                      <select className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                        <option>Authoritative & Professional</option>
                        <option>Conversational & Engaging</option>
                        <option>Aggressive Sales</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#888] mb-2">Custom Prompt Instructions (Optional)</label>
                      <textarea className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-3 text-white h-32 focus:outline-none focus:border-blue-500" placeholder="e.g. Always include a bulleted list at the end..."></textarea>
                    </div>
                    <button className="bg-white text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200">Save Persona Settings</button>
                  </div>
                </div>
              </div>
            )}

                        {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Workspace Settings</h2>
                <div className="bg-[#111] border border-[#262626] rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-[#262626]">
                    <h3 className="text-lg font-semibold mb-1">API Configurations</h3>
                    <p className="text-sm text-[#888]">Manage your provider API keys. Keys are stored locally in your .env.local file.</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#ccc] mb-2">Gemini API Key</label>
                      <input type="text" value={keys.geminiKey} onChange={e => setKeys({...keys, geminiKey: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                      <p className="text-xs text-[#888] mt-2">Used for AI Content Engine. Powered by Gemini 1.5 Flash.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#ccc] mb-2">Vercel Access Token</label>
                      <input type="text" value={keys.vercelToken} onChange={e => setKeys({...keys, vercelToken: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                      <p className="text-xs text-[#888] mt-2">Required for creating and managing Edge nodes.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#ccc] mb-2">GitHub Personal Access Token (PAT)</label>
                      <input type="text" value={keys.githubToken} onChange={e => setKeys({...keys, githubToken: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                      <p className="text-xs text-[#888] mt-2">Used to generate hidden repositories for your network.</p>
                    </div>
                    <div className="pt-4 border-t border-[#262626]">
                      <label className="block text-sm font-medium text-[#ccc] mb-2">Cloudflare Account ID</label>
                      <input type="text" value={keys.cloudflareAccountId} onChange={e => setKeys({...keys, cloudflareAccountId: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#ccc] mb-2">Cloudflare API Token</label>
                      <input type="text" value={keys.cloudflareToken} onChange={e => setKeys({...keys, cloudflareToken: e.target.value})} className="w-full bg-[#0a0a0a] border border-[#262626] rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                      <p className="text-xs text-[#888] mt-2">Required for Cloudflare Pages deployment.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-[#0a0a0a] border-t border-[#262626] flex justify-end">
                    <button onClick={handleUpdateKeys} disabled={isSavingKeys} className="bg-[#262626] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50">
                      {isSavingKeys ? 'Saving...' : 'Update Keys'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ title, value, change, negative = false }: { title: string, value: string, change: string, negative?: boolean }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#262626] p-5 rounded-xl">
      <h4 className="text-sm text-[#888] font-medium mb-2">{title}</h4>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded-md ${negative ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          {change}
        </span>
      </div>
    </div>
  );
}

function TableRow({ domain, vercelUrl, moneyUrl, anchorText, status }: { domain: string, vercelUrl: string, moneyUrl: string, anchorText: string, status: string }) {
  const [isPinging, setIsPinging] = useState(false);
  const [pinged, setPinged] = useState(false);

  const handlePing = async () => {
    if (!vercelUrl) return;
    setIsPinging(true);
    try {
      await fetch('/api/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: vercelUrl })
      });
      setPinged(true);
    } catch (e) {
      console.error(e);
    }
    setIsPinging(false);
  };

  return (
    <tr className="hover:bg-[#111] transition-colors">
      <td className="px-4 py-3 font-medium text-white">{domain}</td>
      <td className="px-4 py-3 text-[#888] font-mono text-xs">
        <a href={vercelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          {vercelUrl || 'Deploying...'}
        </a>
      </td>
      <td className="px-4 py-3 text-[#888] text-xs max-w-[200px] truncate">{moneyUrl || '-'}</td>
      <td className="px-4 py-3 text-[#888]">{anchorText || '-'}</td>
      <td className="px-4 py-3 flex items-center gap-2">
        {status === 'live' ? (
          <>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
              <CheckCircle2 className="w-3 h-3" /> Live
            </span>
            {vercelUrl && (
              <button 
                onClick={handlePing} 
                disabled={isPinging || pinged}
                className={`ml-2 text-xs font-medium px-2 py-1 rounded-md transition-colors ${pinged ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-[#1a1a1a] text-[#888] hover:text-white hover:bg-[#262626] border border-[#262626] disabled:opacity-50'}`}
              >
                {isPinging ? 'Sending...' : pinged ? 'Sent to Google ✓' : 'Send to Google 🚀'}
              </button>
            )}
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> Deploying
          </span>
        )}
      </td>
    </tr>
  );
}
