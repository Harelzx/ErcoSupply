'use client';

import { QuarterProvider } from '@/hooks/useQuarterData';
import { Header } from '@/components/layout/Header';
import { MonthlyTargets } from '@/components/setup/MonthlyTargets';
import { MetricsDashboard } from '@/components/dashboard/MetricsDashboard';
import { QuarterCalendar } from '@/components/calendar/QuarterCalendar';

export default function DashboardPage() {
  return (
    <QuarterProvider>
      <div className="min-h-screen flex flex-col geo-pattern">
        <Header />
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-7 rounded-full bg-gold" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-teal">הגדרת יעדים חודשיים</h2>
            </div>
            <MonthlyTargets />
          </section>

          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-7 rounded-full bg-teal" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-teal">מדדי ביצוע</h2>
            </div>
            <MetricsDashboard />
          </section>

          <section>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1.5 h-7 rounded-full bg-terracotta" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-teal">לוח שנה רבעוני</h2>
            </div>
            <QuarterCalendar />
          </section>
        </main>

        <footer className="border-t border-sand-dark/30 py-4">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs text-warm-gray">
              מחשבון יעדים רבעוני · ניהול יעדי הכנסה יומיים בקלות
            </p>
          </div>
        </footer>
      </div>
    </QuarterProvider>
  );
}
