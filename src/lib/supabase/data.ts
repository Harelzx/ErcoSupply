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

  // A day needs a DB row only when it carries non-default state.
  // Empty rows are deleted so clearing income (entering 0) actually persists.
  const rowsToKeep = days.filter(d => d.actualIncome > 0 || d.note.length > 0);

  if (rowsToKeep.length > 0) {
    const rows = rowsToKeep.map(d => ({
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

  // Reconcile: delete any previously-saved rows in this quarter that are
  // no longer kept. Without this, setting income back to 0 leaves the old
  // value in the DB and it reappears on refresh.
  const keepDates = rowsToKeep.map(d => d.date);
  const delBase = sb.from('day_overrides').delete().eq('quarter_config_id', configId);
  const delQuery = keepDates.length > 0
    ? delBase.not('date', 'in', `(${keepDates.map(d => `"${d}"`).join(',')})`)
    : delBase;
  const { error: delError } = await delQuery;
  if (delError) throw delError;
}
