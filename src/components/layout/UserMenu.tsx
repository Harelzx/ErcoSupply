'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function UserMenu() {
  const [userName, setUserName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      }
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-teal-light/20 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-[11px] font-bold text-white">
          {initials || '?'}
        </div>
        <span className="text-sm text-cream font-medium hidden sm:block max-w-[100px] truncate">
          {userName}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cream/50">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-xl shadow-warm-lg border border-sand-dark/20 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-sand-dark/10">
            <p className="text-xs text-warm-gray truncate">{userName}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full px-3 py-2.5 text-sm text-terracotta font-medium text-right hover:bg-terracotta/5 transition-colors disabled:opacity-50"
          >
            {loading ? 'מתנתק...' : 'התנתק'}
          </button>
        </div>
      )}
    </div>
  );
}
