'use client';

import { useState, useCallback } from 'react';
import { DayRecord, DayType } from '@/lib/types';
import { DAY_TYPE_CONFIG, DAY_TYPE_CYCLE } from '@/lib/constants';
import { formatNumber, formatDate } from '@/lib/format';
import { HEBREW_DAY_FULL_NAMES } from '@/lib/constants';

interface DayCellProps {
  day: DayRecord;
  onDayTypeChange: (date: string, dayType: DayType) => void;
  onIncomeChange: (date: string, income: number) => void;
  onNoteChange: (date: string, note: string) => void;
}

export function DayCell({ day, onDayTypeChange, onIncomeChange, onNoteChange }: DayCellProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const config = DAY_TYPE_CONFIG[day.dayType];
  const dayNum = parseInt(day.date.split('-')[2]);

  const typeIndicatorColor = {
    regular: 'bg-teal-light',
    half: 'bg-gold',
    closed: 'bg-terracotta',
  }[day.dayType];

  return (
    <>
      {/* Cell — click to open dialog */}
      <button
        onClick={() => setDialogOpen(true)}
        className={`
          relative rounded-lg p-2 min-h-[90px] transition-day cursor-pointer text-right
          border border-transparent hover:border-sand-dark/60 hover:shadow-warm
          flex flex-col
          ${day.dayType === 'regular' ? 'bg-white' : ''}
          ${day.dayType === 'half' ? 'bg-gold/[0.06]' : ''}
          ${day.dayType === 'closed' ? 'bg-terracotta/[0.04]' : ''}
        `}
      >
        {/* Top row: day number + type badge */}
        <div className="flex items-start justify-between mb-1 w-full">
          <span className="text-sm font-bold text-teal tabular-nums">{dayNum}</span>
          <span
            className={`
              text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none
              ${day.dayType === 'regular' ? 'bg-teal/10 text-teal' : ''}
              ${day.dayType === 'half' ? 'bg-gold/15 text-gold-dark' : ''}
              ${day.dayType === 'closed' ? 'bg-terracotta/10 text-terracotta' : ''}
            `}
          >
            {config.label}
          </span>
        </div>

        {/* Holiday name */}
        {day.isHoliday && day.holidayName && (
          <div className="text-[9px] text-terracotta font-medium truncate mb-1 leading-tight w-full">
            {day.holidayName}
          </div>
        )}

        {/* Daily target */}
        {day.dailyTarget > 0 && (
          <div className="text-[10px] text-warm-gray tabular-nums mb-1 w-full">
            יעד: {formatNumber(day.dailyTarget)}
          </div>
        )}

        {/* Income display */}
        {day.dayType !== 'closed' && (
          <div
            className={`
              w-full h-6 text-[11px] px-1.5 rounded tabular-nums flex items-center justify-center
              ${day.actualIncome > 0
                ? 'bg-teal/[0.07] text-teal font-semibold'
                : 'bg-sand-light/60 text-warm-gray border border-dashed border-sand-dark/30'
              }
            `}
          >
            {day.actualIncome > 0 ? formatNumber(day.actualIncome) : '+ ₪'}
          </div>
        )}

        {/* Note indicator */}
        <div className="mt-auto pt-1 w-full">
          <div
            className={`
              w-full h-5 text-[10px] px-1.5 rounded flex items-center justify-center truncate
              ${day.note
                ? 'bg-gold/[0.1] text-warm-gray font-medium'
                : 'text-warm-gray-light/50'
              }
            `}
          >
            {day.note || '✎'}
          </div>
        </div>

        {/* Type indicator dot */}
        <div className={`absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full ${typeIndicatorColor}`} />
      </button>

      {/* Detail Dialog */}
      {dialogOpen && (
        <DayDialog
          day={day}
          onClose={() => setDialogOpen(false)}
          onDayTypeChange={onDayTypeChange}
          onIncomeChange={onIncomeChange}
          onNoteChange={onNoteChange}
        />
      )}
    </>
  );
}

function DayDialog({
  day,
  onClose,
  onDayTypeChange,
  onIncomeChange,
  onNoteChange,
}: {
  day: DayRecord;
  onClose: () => void;
  onDayTypeChange: (date: string, dayType: DayType) => void;
  onIncomeChange: (date: string, income: number) => void;
  onNoteChange: (date: string, note: string) => void;
}) {
  const [incomeVal, setIncomeVal] = useState(day.actualIncome > 0 ? String(day.actualIncome) : '');
  const [noteVal, setNoteVal] = useState(day.note || '');
  const dayNum = parseInt(day.date.split('-')[2]);

  const handleSave = () => {
    const num = parseFloat(incomeVal.replace(/,/g, ''));
    if (!isNaN(num) && num >= 0) {
      onIncomeChange(day.date, num);
    } else if (incomeVal === '') {
      onIncomeChange(day.date, 0);
    }
    onNoteChange(day.date, noteVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-teal-dark/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-warm-lg w-[340px] max-w-[90vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-teal px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-cream">
              {dayNum} {HEBREW_DAY_FULL_NAMES[day.dayOfWeek]} · {formatDate(day.date)}
            </h3>
            {day.isHoliday && day.holidayName && (
              <p className="text-sm text-gold-light mt-0.5">{day.holidayName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-cream/60 hover:text-cream text-xl leading-none p-1"
          >
            x
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Day type */}
          <div>
            <label className="block text-xs font-semibold text-warm-gray mb-2">סוג יום</label>
            <div className="flex gap-2">
              {DAY_TYPE_CYCLE.map((type) => {
                const tc = DAY_TYPE_CONFIG[type];
                const isActive = day.dayType === type;
                return (
                  <button
                    key={type}
                    onClick={() => onDayTypeChange(day.date, type)}
                    className={`
                      flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                      ${isActive
                        ? type === 'regular' ? 'bg-teal text-white' :
                          type === 'half' ? 'bg-gold text-white' :
                          'bg-terracotta text-white'
                        : 'bg-sand-light text-warm-gray hover:bg-sand'
                      }
                    `}
                  >
                    {tc.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily target (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-warm-gray mb-1">יעד יומי</label>
            <div className="text-base font-bold text-teal tabular-nums" dir="ltr">
              {day.dailyTarget > 0 ? `${formatNumber(day.dailyTarget)} ₪` : '—'}
            </div>
          </div>

          {/* Income input */}
          <div>
            <label className="block text-xs font-semibold text-warm-gray mb-2">הכנסה בפועל</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-warm-gray">₪</span>
              <input
                type="text"
                inputMode="numeric"
                value={incomeVal}
                onChange={(e) => setIncomeVal(e.target.value.replace(/[^\d.,]/g, ''))}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full h-11 pl-8 pr-3 text-left text-lg font-bold text-teal bg-sand-light/50 border border-sand-dark/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold tabular-nums"
                dir="ltr"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-warm-gray mb-2">הערות</label>
            <textarea
              value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              className="w-full h-20 px-3 py-2 text-sm text-teal bg-sand-light/50 border border-sand-dark/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold resize-none"
              placeholder="הוסף הערה..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 h-10 bg-teal text-cream font-semibold rounded-lg hover:bg-teal-light transition-colors"
          >
            שמור
          </button>
          <button
            onClick={onClose}
            className="h-10 px-4 bg-sand-light text-warm-gray font-medium rounded-lg hover:bg-sand transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
