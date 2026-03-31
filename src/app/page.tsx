import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center geo-pattern px-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-teal mx-auto mb-6 flex items-center justify-center shadow-warm-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold text-teal mb-3">מחשבון יעדים</h1>
        <p className="text-lg text-warm-gray mb-10 leading-relaxed">
          ניהול יעדי הכנסה יומיים לפי רבעון
          <br />
          עם תמיכה בלוח שנה ישראלי וייצוא לאקסל
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="h-12 px-8 bg-teal text-cream font-semibold rounded-xl hover:bg-teal-light transition-colors inline-flex items-center justify-center shadow-warm-md text-base"
          >
            התחבר
          </Link>
          <Link
            href="/signup"
            className="h-12 px-8 bg-white text-teal font-semibold rounded-xl border-2 border-teal/20 hover:border-teal/40 transition-colors inline-flex items-center justify-center text-base"
          >
            צור חשבון
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-warm-gray">
        ErcoSupply · מחשבון יעדים רבעוני
      </footer>
    </div>
  );
}
