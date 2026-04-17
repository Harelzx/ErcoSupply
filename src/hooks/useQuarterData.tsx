'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, useMemo, useEffect, useRef, useState } from 'react';
import { QuarterState, QuarterAction, DayType, MonthData } from '@/lib/types';
import { generateQuarterData, calculateDailyTargets, computeQuarterMetrics } from '@/lib/calculator';
import { getReferenceDateISO } from '@/lib/date';
import { loadQuarterData, saveQuarterConfig, saveDayOverride } from '@/lib/supabase/data';

function getCurrentQuarter(): { quarter: 1 | 2 | 3 | 4; year: number } {
  const now = new Date();
  const month = now.getMonth() + 1;
  const quarter = (Math.ceil(month / 3)) as 1 | 2 | 3 | 4;
  return { quarter, year: now.getFullYear() };
}

function createInitialState(): QuarterState {
  const { quarter, year } = getCurrentQuarter();
  const months = generateQuarterData(quarter, year, [0, 0, 0]);
  return { config: { quarter, year }, months };
}

function quarterReducer(state: QuarterState, action: QuarterAction): QuarterState {
  switch (action.type) {
    case 'SET_QUARTER': {
      const targets: [number, number, number] = [
        state.months[0].monthlyTarget,
        state.months[1].monthlyTarget,
        state.months[2].monthlyTarget,
      ];
      const months = generateQuarterData(action.quarter, action.year, targets);
      return { config: { quarter: action.quarter, year: action.year }, months };
    }

    case 'SET_MONTHLY_TARGET': {
      const newMonths = [...state.months] as [MonthData, MonthData, MonthData];
      const month = newMonths[action.monthIndex];
      const updatedDays = calculateDailyTargets(month.days, action.target);
      newMonths[action.monthIndex] = { ...month, monthlyTarget: action.target, days: updatedDays };
      return { ...state, months: newMonths };
    }

    case 'SET_DAY_TYPE': {
      const newMonths = [...state.months] as [MonthData, MonthData, MonthData];
      for (let mi = 0; mi < 3; mi++) {
        const month = newMonths[mi];
        const dayIdx = month.days.findIndex(d => d.date === action.date);
        if (dayIdx !== -1) {
          const newDays = [...month.days];
          newDays[dayIdx] = { ...newDays[dayIdx], dayType: action.dayType };
          const recalculated = calculateDailyTargets(newDays, month.monthlyTarget);
          newMonths[mi] = { ...month, days: recalculated };
          break;
        }
      }
      return { ...state, months: newMonths };
    }

    case 'SET_ACTUAL_INCOME': {
      const newMonths = [...state.months] as [MonthData, MonthData, MonthData];
      for (let mi = 0; mi < 3; mi++) {
        const month = newMonths[mi];
        const dayIdx = month.days.findIndex(d => d.date === action.date);
        if (dayIdx !== -1) {
          const newDays = [...month.days];
          newDays[dayIdx] = { ...newDays[dayIdx], actualIncome: action.income };
          newMonths[mi] = { ...month, days: newDays };
          break;
        }
      }
      return { ...state, months: newMonths };
    }

    case 'SET_NOTE': {
      const newMonths = [...state.months] as [MonthData, MonthData, MonthData];
      for (let mi = 0; mi < 3; mi++) {
        const month = newMonths[mi];
        const dayIdx = month.days.findIndex(d => d.date === action.date);
        if (dayIdx !== -1) {
          const newDays = [...month.days];
          newDays[dayIdx] = { ...newDays[dayIdx], note: action.note };
          newMonths[mi] = { ...month, days: newDays };
          break;
        }
      }
      return { ...state, months: newMonths };
    }

    default:
      return state;
  }
}

interface QuarterContextValue {
  state: QuarterState;
  dispatch: React.Dispatch<QuarterAction>;
  metrics: ReturnType<typeof computeQuarterMetrics>;
  loading: boolean;
  saving: boolean;
  setQuarter: (quarter: 1 | 2 | 3 | 4, year: number) => void;
  setMonthlyTarget: (monthIndex: number, target: number) => void;
  setDayType: (date: string, dayType: DayType) => void;
  setActualIncome: (date: string, income: number) => void;
  setNote: (date: string, note: string) => void;
}

const QuarterContext = createContext<QuarterContextValue | null>(null);

export function QuarterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quarterReducer, undefined, createInitialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const configIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  const today = useMemo(() => getReferenceDateISO(), []);
  const metrics = useMemo(() => computeQuarterMetrics(state.months, today), [state.months, today]);

  // Load data from Supabase on mount and quarter change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { targets, configId, overrides } = await loadQuarterData(
          state.config.year,
          state.config.quarter
        );
        if (cancelled) return;

        configIdRef.current = configId;

        // Regenerate with loaded targets and apply overrides
        const months = generateQuarterData(state.config.quarter, state.config.year, targets);

        // Apply day overrides
        for (const month of months) {
          for (let i = 0; i < month.days.length; i++) {
            const override = overrides.get(month.days[i].date);
            if (override) {
              if (override.dayType) month.days[i].dayType = override.dayType as DayType;
              if (override.actualIncome !== undefined) month.days[i].actualIncome = override.actualIncome;
              if (override.note !== undefined) month.days[i].note = override.note;
            }
          }
          // Recalculate targets with overridden day types
          const recalculated = calculateDailyTargets(month.days, month.monthlyTarget);
          month.days = recalculated;
        }

        // Apply loaded state
        if (targets[0] > 0 || targets[1] > 0 || targets[2] > 0 || overrides.size > 0) {
          dispatch({ type: 'SET_QUARTER', quarter: state.config.quarter, year: state.config.year });
          // Now set targets
          for (let i = 0; i < 3; i++) {
            if (targets[i] > 0) {
              dispatch({ type: 'SET_MONTHLY_TARGET', monthIndex: i, target: targets[i] });
            }
          }
          // Apply overrides
          for (const [date, override] of overrides) {
            if (override.dayType) {
              dispatch({ type: 'SET_DAY_TYPE', date, dayType: override.dayType as DayType });
            }
            if (override.actualIncome && override.actualIncome > 0) {
              dispatch({ type: 'SET_ACTUAL_INCOME', date, income: override.actualIncome });
            }
            if (override.note) {
              dispatch({ type: 'SET_NOTE', date, note: override.note });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load quarter data:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          // Mark initial load complete after a tick
          setTimeout(() => { isInitialLoad.current = false; }, 100);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [state.config.quarter, state.config.year]);

  // Debounced auto-save
  useEffect(() => {
    if (isInitialLoad.current || loading) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const targets: [number, number, number] = [
          state.months[0].monthlyTarget,
          state.months[1].monthlyTarget,
          state.months[2].monthlyTarget,
        ];

        const id = await saveQuarterConfig(state.config.year, state.config.quarter, targets);
        if (id) {
          configIdRef.current = id;

          // Save all modified day overrides
          for (const month of state.months) {
            for (const day of month.days) {
              if (day.actualIncome > 0 || day.note) {
                await saveDayOverride(id, day.date, day.dayType, day.actualIncome, day.note);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to save:', err);
      } finally {
        setSaving(false);
      }
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.months, state.config, loading]);

  const setQuarter = useCallback((quarter: 1 | 2 | 3 | 4, year: number) => {
    isInitialLoad.current = true;
    configIdRef.current = null;
    dispatch({ type: 'SET_QUARTER', quarter, year });
  }, []);

  const setMonthlyTarget = useCallback((monthIndex: number, target: number) => {
    dispatch({ type: 'SET_MONTHLY_TARGET', monthIndex, target });
  }, []);

  const setDayType = useCallback((date: string, dayType: DayType) => {
    dispatch({ type: 'SET_DAY_TYPE', date, dayType });
  }, []);

  const setActualIncome = useCallback((date: string, income: number) => {
    dispatch({ type: 'SET_ACTUAL_INCOME', date, income });
  }, []);

  const setNote = useCallback((date: string, note: string) => {
    dispatch({ type: 'SET_NOTE', date, note });
  }, []);

  const value = useMemo(() => ({
    state,
    dispatch,
    metrics,
    loading,
    saving,
    setQuarter,
    setMonthlyTarget,
    setDayType,
    setActualIncome,
    setNote,
  }), [state, metrics, loading, saving, setQuarter, setMonthlyTarget, setDayType, setActualIncome, setNote]);

  return (
    <QuarterContext.Provider value={value}>
      {children}
    </QuarterContext.Provider>
  );
}

export function useQuarterData() {
  const ctx = useContext(QuarterContext);
  if (!ctx) throw new Error('useQuarterData must be used within QuarterProvider');
  return ctx;
}
