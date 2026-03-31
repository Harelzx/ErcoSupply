'use client';

import { createContext, useContext, useReducer, useCallback, ReactNode, useMemo } from 'react';
import { QuarterState, QuarterAction, DayType, MonthData } from '@/lib/types';
import { generateQuarterData, calculateDailyTargets, computeQuarterMetrics, computeMonthMetrics } from '@/lib/calculator';

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
      const months = generateQuarterData(
        action.quarter,
        action.year,
        targets,
      );
      return {
        config: { quarter: action.quarter, year: action.year },
        months,
      };
    }

    case 'SET_MONTHLY_TARGET': {
      const newMonths = [...state.months] as [MonthData, MonthData, MonthData];
      const month = newMonths[action.monthIndex];
      const updatedDays = calculateDailyTargets(month.days, action.target);
      newMonths[action.monthIndex] = {
        ...month,
        monthlyTarget: action.target,
        days: updatedDays,
      };
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
  setQuarter: (quarter: 1 | 2 | 3 | 4, year: number) => void;
  setMonthlyTarget: (monthIndex: number, target: number) => void;
  setDayType: (date: string, dayType: DayType) => void;
  setActualIncome: (date: string, income: number) => void;
  setNote: (date: string, note: string) => void;
}

const QuarterContext = createContext<QuarterContextValue | null>(null);

export function QuarterProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quarterReducer, undefined, createInitialState);

  const metrics = useMemo(() => computeQuarterMetrics(state.months), [state.months]);

  const setQuarter = useCallback((quarter: 1 | 2 | 3 | 4, year: number) => {
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
    setQuarter,
    setMonthlyTarget,
    setDayType,
    setActualIncome,
    setNote,
  }), [state, metrics, setQuarter, setMonthlyTarget, setDayType, setActualIncome, setNote]);

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
