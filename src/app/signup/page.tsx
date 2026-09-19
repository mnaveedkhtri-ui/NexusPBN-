'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to register');
        setIsLoading(false);
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans text-[#ededed]">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">
              N
            </div>
            <span className="font-bold tracking-widest text-lg">NEXUS<span className="text-[#888]">PBN</span></span>
          </Link>
        </div>

        <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
            <p className="text-[#888] text-sm">Get started with automated SEO networks</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-900/50 text-red-500 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#404040] focus:ring-1 focus:ring-[#404040] transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#404040] focus:ring-1 focus:ring-[#404040] transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#404040] focus:ring-1 focus:ring-[#404040] transition-all"
                placeholder="????????"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !email || !password || !name}
              className="w-full bg-white text-black hover:bg-[#e5e5e5] disabled:opacity-50 disabled:hover:bg-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#888] mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
