import jsPDF from "jspdf";
import "jspdf-autotable";
import { formatDate } from "./dateUtils";

// Export expenses to CSV
export const exportToCSV = (expenses) => {
  if (!expenses || expenses.length === 0) {
    alert("No expenses to export");
    return;
  }

  // Create CSV header row
  const csvRows = [["Date", "Category", "Description", "Amount"]];

  // Add expense data rows
  expenses.forEach((expense) => {
    csvRows.push([
      formatDate(expense.date),
      expense.category,
      expense.description || "",
      expense.amount.toFixed(2),
    ]);
  });

  // Convert to CSV string
  const csvString = csvRows.map((row) => row.join(",")).join("\n");

  // Create download link
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  // Set up download
  link.setAttribute("href", url);
  link.setAttribute("download", `expenses_${formatDate(new Date())}.csv`);
  link.style.visibility = "hidden";

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export expenses to PDF
export const exportToPDF = (expenses, title = "Expense Report") => {
  if (!expenses || expenses.length === 0) {
    alert("No expenses to export");
    return;
  }

  // Create PDF document
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Add generated date
  doc.setFontSize(10);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 30);

  // Calculate total amount
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Create table data
  const tableColumn = ["Date", "Category", "Description", "Amount"];
  const tableRows = expenses.map((expense) => [
    formatDate(expense.date),
    expense.category,
    expense.description || "",
    `$${expense.amount.toFixed(2)}`,
  ]);

  // Add total row
  tableRows.push(["", "", "TOTAL", `$${total.toFixed(2)}`]);

  // Generate table
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Save PDF
  doc.save(`expense_report_${formatDate(new Date())}.pdf`);
};
