'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message === 'User already registered'
        ? 'משתמש עם אימייל זה כבר קיים'
        : error.message
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center geo-pattern px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-warm-lg border border-sand-dark/20 overflow-hidden">
            <div className="bg-teal px-6 py-4">
              <h2 className="text-lg font-bold text-cream">ההרשמה הושלמה</h2>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal/10 mx-auto flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B4D4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-sm text-warm-gray">
                בדוק את תיבת האימייל שלך לאימות החשבון, ולאחר מכן התחבר.
              </p>
              <Link
                href="/login"
                className="inline-block h-10 px-6 bg-teal text-cream font-semibold rounded-lg hover:bg-teal-light transition-colors leading-10"
              >
                למסך התחברות
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-lg font-bold text-cream">הרשמה</h2>
            <p className="text-sm text-cream/60">צור חשבון חדש</p>
          </div>

          <form onSubmit={handleSignup} className="p-6 space-y-4">
            {error && (
              <div className="bg-terracotta/10 border border-terracotta/20 rounded-lg px-4 py-3 text-sm text-terracotta font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-warm-gray mb-2">שם מלא</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="ישראל ישראלי"
                className="w-full h-11 px-4 text-sm text-teal bg-sand-light/50 border border-sand-dark/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

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
                placeholder="לפחות 6 תווים"
                className="w-full h-11 px-4 text-sm text-teal bg-sand-light/50 border border-sand-dark/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-warm-gray mb-2">אישור סיסמה</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'נרשם...' : 'הירשם'}
            </button>
          </form>

          <div className="px-6 pb-6 text-center">
            <p className="text-sm text-warm-gray">
              יש לך חשבון?{' '}
              <Link href="/login" className="text-gold-dark font-semibold hover:text-gold transition-colors">
                התחבר
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
