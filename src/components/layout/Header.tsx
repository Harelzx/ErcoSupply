'use client';

import { useQuarterData } from '@/hooks/useQuarterData';
import { QuarterPicker } from '@/components/setup/QuarterPicker';
import { ExportButton } from '@/components/export/ExportButton';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-teal/95 backdrop-blur-sm border-b border-teal-dark">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-cream tracking-tight">
                מחשבון יעדים
              </h1>
            </div>
            <div className="hidden sm:block h-6 w-px bg-teal-light/30" />
            <div className="hidden sm:block">
              <QuarterPicker />
            </div>
          </div>
          <ExportButton />
        </div>
        <div className="sm:hidden pb-3">
          <QuarterPicker />
        </div>
      </div>
    </header>
  );
}
