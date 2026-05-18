import { createClient } from './client';
import { DayRecord } from '../types';

const supabase = () => createClient();

export async function loadQuarterData(year: number, quarter: number): Promise<{
  targets: [number, number, number];
  configId: string | null;
  overrides: Map<string, { dayType?: string; actualIncome?: number; note?: string }>;
}> {
  const sb = supabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return { targets: [0, 0, 0], configId: null, overrides: new Map() };

  // Load quarter config
  const { data: config } = await sb.from('quarter_configs')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', year)
    .eq('quarter', quarter)
    .single();

  const targets: [number, number, number] = config
    ? [Number(config.target_month_1), Number(config.target_month_2), Number(config.target_month_3)]
    : [0, 0, 0];

  // Load day overrides
  const overrides = new Map<string, { dayType?: string; actualIncome?: number; note?: string }>();
  if (config) {
    const { data: days } = await sb.from('day_overrides')
      .select('*')
      .eq('quarter_config_id', config.id);

    if (days) {
      for (const d of days) {
        overrides.set(d.date, {
          dayType: d.day_type,
          actualIncome: Number(d.actual_income),
          note: d.note || '',
        });
      }
    }
  }

  return { targets, configId: config?.id || null, overrides };
}

export async function saveQuarterConfig(
  year: number,
  quarter: number,
  targets: [number, number, number]
): Promise<string | null> {
  const sb = supabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await sb.from('quarter_configs')
    .upsert({
      user_id: user.id,
      year,
      quarter,
      target_month_1: targets[0],
      target_month_2: targets[1],
      target_month_3: targets[2],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,year,quarter',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data?.id || null;
}

export async function saveDayOverrides(
  configId: string,
  days: DayRecord[]
): Promise<void> {
  const sb = supabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  if (!configId) throw new Error('Missing quarter config id');

  const modifiedDays = days.filter(d => d.actualIncome > 0 || d.note);
  if (modifiedDays.length === 0) return;

  const rows = modifiedDays.map(d => ({
    user_id: user.id,
    quarter_config_id: configId,
    date: d.date,
    day_type: d.dayType,
    actual_income: d.actualIncome,
    note: d.note,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await sb.from('day_overrides')
    .upsert(rows, { onConflict: 'quarter_config_id,date' });

  if (error) throw error;
}
