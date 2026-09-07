/**
 * Utility to format and trigger a clean, RFC-4180 compliant CSV export in the browser
 */
export const exportToCSV = (headers = [], rows = [], filename = 'routewise-report.csv') => {
  if (!headers || headers.length === 0) {
    throw new Error('CSV Export requires at least one header column.');
  }

  // Escape special characters (commas, quotes, newlines) according to RFC-4180
  const formatCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const headerLine = headers.map(formatCell).join(',');
  const rowLines = rows.map((row) => row.map(formatCell).join(','));

  const csvContent = [headerLine, ...rowLines].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportService = {
  exportToCSV,
  exportToCsv: (filename, data = [], headers = []) => {
    const colLabels = headers.map(h => h.label);
    const rows = data.map(item => headers.map(h => item[h.key] ?? ''));
    exportToCSV(colLabels, rows, `${filename}.csv`);
  }
};

export default exportService;
