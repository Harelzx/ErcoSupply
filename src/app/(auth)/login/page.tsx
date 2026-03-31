'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'אימייל או סיסמה שגויים'
        : error.message
      );
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center geo-pattern px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-teal mx-auto mb-4 flex items-center justify-center shadow-warm-md">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-teal">מחשבון יעדים</h1>
          <p className="text-sm text-warm-gray mt-1">ניהול יעדי הכנסה יומיים</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-warm-lg border border-sand-dark/20 overflow-hidden">
          <div className="bg-teal px-6 py-4">
            <h2 className="text-lg font-bold text-cream">התחברות</h2>
            <p className="text-sm text-cream/60">הזן את פרטי החשבון שלך</p>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {error && (
              <div className="bg-terracotta/10 border border-terracotta/20 rounded-lg px-4 py-3 text-sm text-terracotta font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-warm-gray mb-2">אימייל</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                placeholder="name@example.com"
                className="w-full h-11 px-4 text-sm text-teal bg-sand-light/50 border border-sand-dark/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-gray mb-2">סיסמה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                placeholder="••••••••"
                className="w-full h-11 px-4 text-sm text-teal bg-sand-light/50 border border-sand-dark/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-teal text-cream font-semibold rounded-lg hover:bg-teal-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-warm-gray">
              אין לך חשבון?{' '}
              <Link href="/signup" className="text-gold-dark font-semibold hover:text-gold transition-colors">
                הירשם
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
