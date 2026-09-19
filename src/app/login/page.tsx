'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
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
            <h1 className="text-2xl font-semibold mb-2">Welcome to NexusPBN</h1>
            <p className="text-[#888] text-sm">Sign in to deploy your automated SEO networks</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-900/50 text-red-500 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
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
              disabled={isLoading || !email || !password}
              className="w-full bg-white text-black hover:bg-[#e5e5e5] disabled:opacity-50 disabled:hover:bg-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#888] mt-8">
            Don't have an account?{' '}
            <Link href="/signup" className="text-white hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
