'use client';

import { useState, useEffect } from 'react';
import { useQuarterData } from '@/hooks/useQuarterData';
import { Skeleton } from '@/components/ui/skeleton';

export function MonthlyTargets() {
  const { state, setMonthlyTarget, loading } = useQuarterData();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-warm border border-sand-dark/50">
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {state.months.map((month, idx) => (
        <TargetInput
          key={`${month.year}-${month.month}`}
          label={month.hebrewName}
          value={month.monthlyTarget}
          onChange={(val) => setMonthlyTarget(idx, val)}
        />
      ))}
    </div>
  );
}

function TargetInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  const [inputValue, setInputValue] = useState(value > 0 ? String(value) : '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(value > 0 ? String(value) : '');
    }
  }, [value, isFocused]);

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(inputValue.replace(/,/g, ''));
    if (!isNaN(num) && num >= 0) {
      onChange(num);
    } else if (inputValue === '') {
      onChange(0);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-warm border border-sand-dark/50 transition-all hover:shadow-warm-md">
      <label className="block text-sm font-semibold text-warm-gray mb-2 tracking-wide">
        יעד {label}
      </label>
      {/* ₪ is a flex sibling (not an absolute overlay) so it can never overlap
          the number — iOS Safari ignores an input's padding. The number is
          right-aligned with ₪ to its right, matching the value displays. The
          inter-gap lives on the ₪ span's padding (reliable) rather than the
          input's (which iOS may drop). */}
      <div
        dir="ltr"
        className="flex items-center h-12 bg-sand-light/50 border border-sand-dark/30 rounded-lg overflow-hidden transition-colors focus-within:ring-2 focus-within:ring-gold/50 focus-within:border-gold"
      >
        <input
          type="text"
          inputMode="numeric"
          value={isFocused ? inputValue : (value > 0 ? Number(value).toLocaleString('he-IL') : '')}
          onChange={(e) => setInputValue(e.target.value.replace(/[^\d.,]/g, ''))}
          onFocus={() => {
            setIsFocused(true);
            setInputValue(value > 0 ? String(value) : '');
          }}
          onBlur={handleBlur}
          placeholder="0"
          className="flex-1 min-w-0 h-full bg-transparent pl-3 text-right text-xl font-bold text-teal tabular-nums outline-none"
          dir="ltr"
        />
        <span className="shrink-0 pl-2 pr-3 text-base text-warm-gray font-medium select-none">₪</span>
      </div>
    </div>
  );
}
