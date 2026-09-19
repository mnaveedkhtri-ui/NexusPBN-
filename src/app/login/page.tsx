'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
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
            <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
            <p className="text-[#888] text-sm">Enter your credentials to access your networks</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#888] mb-2">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#404040] focus:ring-1 focus:ring-[#404040] transition-all"
                placeholder="naveed@example.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#888]">Password</label>
                <Link href="#" className="text-xs text-[#888] hover:text-white transition-colors">Forgot password?</Link>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#262626] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#404040] focus:ring-1 focus:ring-[#404040] transition-all"
                placeholder="••••••••"
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

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px bg-[#262626] flex-1"></div>
            <span className="text-xs text-[#888] font-medium uppercase tracking-wider">Or continue with</span>
            <div className="h-px bg-[#262626] flex-1"></div>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <button 
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              type="button" 
              className="w-full flex items-center justify-center py-2.5 px-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#262626] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[#888] mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="text-sm font-medium">Continue with Google</span>
            </button>
          </div>

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
