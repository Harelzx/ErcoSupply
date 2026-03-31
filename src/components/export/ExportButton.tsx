'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useQuarterData } from '@/hooks/useQuarterData';
import { generateExcelWorkbook } from '@/lib/excel-export';

export function ExportButton() {
  const { state } = useQuarterData();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await generateExcelWorkbook(state);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={exporting}
      variant="outline"
      size="sm"
      className="bg-gold/20 border-gold/40 text-cream hover:bg-gold/30 hover:text-white text-xs font-semibold gap-1.5"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {exporting ? 'מייצא...' : 'ייצוא Excel'}
    </Button>
  );
}
