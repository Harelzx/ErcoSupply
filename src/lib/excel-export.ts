import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { QuarterState } from './types';
import { COLUMN_HEADERS, HEBREW_DAY_NAMES, DAY_TYPE_CONFIG, QUARTER_LABELS } from './constants';
import { computeCumulativeRow, computeUpdatedDailyTarget } from './calculator';
import { formatDate } from './format';

export async function generateExcelWorkbook(state: QuarterState) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'מחשבון יעדים רבעוני';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(
    `${QUARTER_LABELS[state.config.quarter]} ${state.config.year}`,
    { views: [{ rightToLeft: true }] }
  );

  // Column widths
  worksheet.columns = [
    { width: 14 }, // תאריך
    { width: 6 },  // יום
    { width: 8 },  // סוג יום
    { width: 14 }, // יעד יומי
    { width: 14 }, // הכנסה בפועל
    { width: 16 }, // יעד מצטבר חודשי
    { width: 16 }, // הכנסה מצטברת
    { width: 12 }, // % עמידה יומי
    { width: 12 }, // % עמידה חודשי
    { width: 14 }, // % עמידה רבעוני
    { width: 20 }, // הערות
    { width: 14 }, // יעד מעודכן
  ];

  // Header row
  const headerRow = worksheet.addRow(COLUMN_HEADERS);
  headerRow.font = { bold: true, size: 11, name: 'Arial' };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1B4D4A' },
  };
  headerRow.font = { bold: true, size: 11, color: { argb: 'FFF5F0E8' }, name: 'Arial' };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 28;

  // Data rows per month
  for (let mi = 0; mi < 3; mi++) {
    const month = state.months[mi];

    // Month separator row
    if (mi > 0) {
      const sepRow = worksheet.addRow([`── ${month.hebrewName} ${month.year} ──`]);
      sepRow.font = { bold: true, size: 10, color: { argb: 'FF8B7E6F' } };
      worksheet.mergeCells(sepRow.number, 1, sepRow.number, 12);
      sepRow.alignment = { horizontal: 'center' };
      sepRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEDE5D5' },
      };
    }

    const updatedTarget = computeUpdatedDailyTarget(month);

    for (let di = 0; di < month.days.length; di++) {
      const day = month.days[di];
      const cum = computeCumulativeRow(month, di, state.months, mi);
      const dayUpdatedTarget = day.dayType === 'regular' ? updatedTarget.updatedRegularTarget
        : day.dayType === 'half' ? updatedTarget.updatedHalfTarget : 0;

      const row = worksheet.addRow([
        formatDate(day.date),
        day.hebrewDayName,
        DAY_TYPE_CONFIG[day.dayType].label,
        day.dailyTarget,
        day.actualIncome || '',
        cum.cumTarget,
        cum.cumIncome,
        cum.dailyAchievement,
        cum.monthlyAchievement,
        cum.quarterlyAchievement,
        day.note || '',
        dayUpdatedTarget || '',
      ]);

      // Number formatting
      [4, 5, 6, 7].forEach(col => {
        const cell = row.getCell(col);
        cell.numFmt = '#,##0.00';
      });
      [8, 9, 10].forEach(col => {
        const cell = row.getCell(col);
        cell.numFmt = '0.0%';
      });

      // Row styling based on day type
      row.alignment = { horizontal: 'center', vertical: 'middle' };
      row.font = { size: 10, name: 'Arial' };

      if (day.dayType === 'closed') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFAF5F2' },
        };
        row.font = { size: 10, name: 'Arial', color: { argb: 'FFC4704B' } };
      } else if (day.dayType === 'half') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFDF9F0' },
        };
      }

      // Holiday highlight
      if (day.isHoliday && day.holidayName) {
        row.getCell(3).value = `${DAY_TYPE_CONFIG[day.dayType].label} (${day.holidayName})`;
        row.getCell(3).font = { size: 9, name: 'Arial', italic: true };
      }
    }
  }

  // Summary section
  worksheet.addRow([]);
  const summaryHeader = worksheet.addRow(['סיכום רבעוני']);
  summaryHeader.font = { bold: true, size: 12, color: { argb: 'FF1B4D4A' } };
  worksheet.mergeCells(summaryHeader.number, 1, summaryHeader.number, 12);

  for (let mi = 0; mi < 3; mi++) {
    const month = state.months[mi];
    const totalIncome = month.days.reduce((s, d) => s + d.actualIncome, 0);
    const achievement = month.monthlyTarget > 0 ? totalIncome / month.monthlyTarget : 0;

    const row = worksheet.addRow([
      month.hebrewName,
      '', '',
      '', '',
      `יעד: ${month.monthlyTarget.toLocaleString('he-IL')}`,
      `הכנסה: ${totalIncome.toLocaleString('he-IL')}`,
      '',
      achievement,
      '',
    ]);
    row.font = { size: 10, name: 'Arial' };
    row.getCell(9).numFmt = '0.0%';
  }

  // Auto-filter on header
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 12 },
  };

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `יעדים_${QUARTER_LABELS[state.config.quarter]}_${state.config.year}.xlsx`);
}
