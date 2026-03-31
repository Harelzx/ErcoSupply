'use client';

import { useState, useEffect } from 'react';
import { useQuarterData } from '@/hooks/useQuarterData';
import { formatCurrency } from '@/lib/format';

export function MonthlyTargets() {
  const { state, setMonthlyTarget } = useQuarterData();

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
      <label className="block text-xs font-semibold text-warm-gray mb-2 tracking-wide">
        יעד {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-gray font-medium">
          ₪
        </span>
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
          className="w-full h-11 pl-8 pr-3 text-left text-lg font-bold text-teal bg-sand-light/50 border border-sand-dark/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold tabular-nums transition-colors"
          dir="ltr"
        />
      </div>
    </div>
  );
}
