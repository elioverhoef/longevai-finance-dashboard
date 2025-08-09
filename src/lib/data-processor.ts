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
    let allSectionLines = lines;
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
      (parsed.data as ParsedTransaction[]).filter(r => r.Date && r.Date.match(/^\d{4}-\d{2}-\d{2}/)).forEach(row => {
        const isInvoice = row.Reference?.startsWith('INV ');
        const isPayment = row.Reference?.startsWith('TRA ');
        const desc = (row.Description || '').replace(/\n/g, ' ');
        const idMatch = (row.Reference || desc).match(/\b(\d{4}-\d{4})\b/);
        const invoiceId = idMatch ? idMatch[1] : '';
        if (isInvoice && invoiceId) {
          const amount = parseFloat(row.Amount) || 0;
          receivableInvoices.push({
            invoiceId,
            client: (row.Reference || '').split(' - ').pop() || 'Unknown',
            issueDate: row.Date,
            invoicedAmount: amount,
            paidAmount: 0,
            outstandingAmount: amount,
            daysOutstanding: Math.floor((Date.now() - new Date(row.Date).getTime()) / (1000 * 3600 * 24)),
          });
        } else if (isPayment && invoiceId) {
          const payAmount = Math.abs(parseFloat(row.Amount) || 0);
          const inv = receivableInvoices.find(inv => inv.invoiceId === invoiceId);
          if (inv) {
            inv.paidAmount += payAmount;
            inv.outstandingAmount = Math.max(0, inv.invoicedAmount - inv.paidAmount);
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