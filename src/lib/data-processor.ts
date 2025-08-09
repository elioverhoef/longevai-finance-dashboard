import Papa from 'papaparse';
import { Transaction, FinancialData } from '../types/financial';
import { projectKeywords, categoryKeywords } from '../config/categorization';

interface ParsedTransaction {
  Date: string;
  Reference: string;
  Description: string;
  VAT: string;
  Amount: string;
}

const normalizeDescription = (desc: string): string =>
  desc.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim().toLowerCase();

export const categorizeTransaction = (description: string, ledgerCategory?: string): string => {
  const normalizedDesc = normalizeDescription(description);
  let normalizedLedgerCategory = ledgerCategory;
  if (ledgerCategory) {
    normalizedLedgerCategory = ledgerCategory.trim();
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => normalizedDesc.includes(keyword))) {
      return category;
    }
  }

  if (normalizedLedgerCategory) {
    const lc = normalizedLedgerCategory.toLowerCase();
    if (lc.startsWith('bank charges')) return 'Bank & Payment Fees';
    if (lc.startsWith('payable vat') || lc.startsWith('sales tax')) return 'Taxes & Accounting';
    if (lc.startsWith('uncategorized income') || lc.startsWith('revenue')) return 'Client Revenue';
    if (lc.startsWith('office') || lc.includes('meeting')) return 'Office & Meetings';
    return normalizedLedgerCategory;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('Uncategorized transaction:', description);
  }
  return 'Uncategorized';
};

export const extractProject = (description: string): string | undefined => {
  const normalizedDesc = normalizeDescription(description);
  for (const project of projectKeywords) {
    if (normalizedDesc.includes(project.toLowerCase())) {
      if (project === 'Patrick Burgermeister') {
        return 'RegenEra';
      }
      return project;
    }
  }
  if (normalizedDesc.includes('burgermeister patrick')) {
    return 'RegenEra';
  }
  return undefined;
};

export const parseCSVData = (csvContent: string): FinancialData => {
  const sections = csvContent.split(/\n(?=(?!Total,)[A-Za-z][^\n]*,,,,)/);
  let rawBankTransactions: ParsedTransaction[] = [];
  let outstandingReceivables = 0;
  let actualBankBalance = 0;
  const ledgerCategoryMap = new Map<string, string>();
  const receivableInvoices: Array<{ invoiceId: string; client: string; issueDate: string; invoicedAmount: number; paidAmount: number; outstandingAmount: number; daysOutstanding: number; }> = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    const lines = section.split('\n');
    if (lines.length < 2) continue;

    const headerLine = lines[0];
    const sectionName = headerLine.split(',')[0].trim();

    // Include possible Total line that might appear in next section for Accounts receivable
    const allSectionLines = lines.slice();
    if (sectionName === 'Accounts receivable' && i + 1 < sections.length) {
      const nextSection = sections[i + 1].trim();
      const nextSectionLines = nextSection.split('\n');
      for (let j = 0; j < Math.min(3, nextSectionLines.length); j++) {
        if (nextSectionLines[j].trim().startsWith('Total,')) {
          allSectionLines.push(nextSectionLines[j]);
          break;
        }
      }
    }

    const csvData = allSectionLines.slice(1).join('\n');

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim()
    });

    if (parsed.errors.length > 0 && !(parsed.errors.length === 1 && parsed.errors[0].code === 'TooFewFields')) {
      console.warn(`Parsing errors in section "${sectionName}":`, parsed.errors);
    }

    if (sectionName === 'Accounts receivable') {
      const totalLine = allSectionLines.find(line => line.trim().startsWith('Total,'));
      if (totalLine) {
        const totalParts = totalLine.split(',');
        if (totalParts.length >= 5) {
          outstandingReceivables = parseFloat(totalParts[4].trim()) || 0;
        }
      }
      // Build invoice entries for receivables
      const rows = (parsed.data as ParsedTransaction[]).filter(r => r.Date && r.Date.match(/^\d{4}-\d{2}-\d{2}/));

      // First pass: create invoices
      rows.forEach(row => {
        const isInvoice = row.Reference?.startsWith('INV ');
        if (!isInvoice) return;
        const desc = (row.Description || '').replace(/\n/g, ' ');
        const idMatch = `${row.Reference || ''} ${desc}`.match(/\b(\d{4}-\d{4})\b/);
        const invoiceId = idMatch ? idMatch[1] : '';
        if (!invoiceId) return;
        const amount = parseFloat(row.Amount) || 0;
        const clientFromRef = (row.Reference || '').split(' - ').pop() || 'Unknown';
        receivableInvoices.push({
          invoiceId,
          client: clientFromRef,
          issueDate: row.Date,
          invoicedAmount: amount,
          paidAmount: 0,
          outstandingAmount: amount,
          daysOutstanding: Math.floor((Date.now() - new Date(row.Date).getTime()) / (1000 * 3600 * 24)),
        });
      });

      // Helper to detect client names in free text
      const detectClient = (text: string): string | undefined => {
        const t = (text || '').toLowerCase();
        for (const name of projectKeywords) {
          if (t.includes(name.toLowerCase())) return name;
        }
        if (t.includes('burgermeister patrick')) return 'Patrick Burgermeister';
        return undefined;
      };

      // Second pass: apply payments
      rows.forEach(row => {
        const ref = row.Reference || '';
        const isPayment = ref.startsWith('TRA ') || ref.startsWith('PAY ');
        if (!isPayment) return;
        const desc = (row.Description || '').replace(/\n/g, ' ');
        const idMatch = `${ref} ${desc}`.match(/\b(\d{4}-\d{4})\b/);
        const paymentAmount = Math.abs(parseFloat(row.Amount) || 0);
        if (idMatch) {
          const invoiceId = idMatch[1];
          const inv = receivableInvoices.find(inv => inv.invoiceId === invoiceId);
          if (inv) {
            inv.paidAmount += paymentAmount;
            inv.outstandingAmount = Math.max(0, inv.invoicedAmount - inv.paidAmount);
          }
        } else {
          // Fallback: try match by client name and amount, then FIFO
          const client = detectClient(`${ref} ${desc}`);
          if (client) {
            let remaining = paymentAmount;
            // Exact amount first
            const exact = receivableInvoices.find(inv => inv.client === client && Math.abs(inv.outstandingAmount - remaining) < 0.01);
            if (exact) {
              exact.paidAmount += remaining;
              exact.outstandingAmount = Math.max(0, exact.invoicedAmount - exact.paidAmount);
              remaining = 0;
            }
            // FIFO for remainder
            const candidates = receivableInvoices
              .filter(inv => inv.client === client && inv.outstandingAmount > 0)
              .sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
            for (const inv of candidates) {
              if (remaining <= 0) break;
              const apply = Math.min(inv.outstandingAmount, remaining);
              inv.paidAmount += apply;
              inv.outstandingAmount = Math.max(0, inv.invoicedAmount - inv.paidAmount);
              remaining -= apply;
            }
          }
        }
      });
    }

    const transactions = parsed.data.filter((row: unknown) => {
      const typedRow = row as Record<string, string>;
      return typedRow.Date && typedRow.Date.match(/^\d{4}-\d{2}-\d{2}/);
    }) as ParsedTransaction[];

    if (sectionName.startsWith('Bunq NL75BUNQ')) {
      rawBankTransactions = rawBankTransactions.concat(transactions);
      const totalLine = allSectionLines.find(line => line.trim().startsWith('Total,'));
      if (totalLine) {
        const totalParts = totalLine.split(',');
        if (totalParts.length >= 5) {
          const totalValue = totalParts[4].trim();
          if (totalValue && totalValue !== '') {
            actualBankBalance = parseFloat(totalValue) || 0;
          }
        }
      }
    } else if (sectionName && !['Transactions to be classified', 'Settlements', 'Cash control', 'Unbilled revenue', 'Payable VAT', 'Sales tax paid or received', 'Accounts receivable'].includes(sectionName)) {
      transactions.forEach(t => {
        const cleanDescription = normalizeDescription((t.Description || '').split('\n')[0]);
        if (cleanDescription && !ledgerCategoryMap.has(cleanDescription)) {
          const category = sectionName.includes('(') ? sectionName.split('(')[0].trim() : sectionName;
          ledgerCategoryMap.set(cleanDescription, category);
        }
      });
    }
  }

  const allTransactions: Transaction[] = rawBankTransactions.map((t: ParsedTransaction, index: number) => {
    const amount = parseFloat(t.Amount) || 0;
    const description = t.Description || '';
    const normalizedDesc = normalizeDescription(description.split('\n')[0]);
    const ledgerCategory = ledgerCategoryMap.get(normalizedDesc);

    return {
      id: index,
      date: t.Date,
      reference: t.Reference || '',
      description: description,
      vat: t.VAT || '',
      amount: amount,
      category: categorizeTransaction(description, ledgerCategory),
      project: extractProject(description)
    };
  });

  const totalRevenue = allTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(allTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

  return {
    allTransactions,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    currentBalance: actualBankBalance,
    outstandingReceivables,
    receivables: {
      totalOutstanding: receivableInvoices.reduce((s, inv) => s + Math.max(0, inv.outstandingAmount), 0),
      invoices: receivableInvoices.filter(inv => inv.outstandingAmount > 0)
    }
  };
};