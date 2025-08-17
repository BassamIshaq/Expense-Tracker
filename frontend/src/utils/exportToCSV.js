export function exportToCSV(expenses) {
  const csvRows = [
    ['Date', 'Category', 'Description', 'Amount'],
    ...expenses.map(exp => [exp.date, exp.category, exp.description, exp.amount])
  ];
  const csvString = csvRows.map(e => e.join(',')).join('\n');

  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'expenses.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}