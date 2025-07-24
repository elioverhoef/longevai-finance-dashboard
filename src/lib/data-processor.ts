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
    const sections = csvContent.split(/\n(?=[A-Za-z\s()0-9].*,,,,)/);
    let rawBankTransactions: ParsedTransaction[] = [];
    let outstandingReceivables = 0;
    const ledgerCategoryMap = new Map<string, string>();

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        const lines = section.split('\n');
        if (lines.length < 2) continue;

        const headerLine = lines[0];
        const sectionName = headerLine.split(',')[0].trim();
        const csvData = lines.slice(1).join('\n');

        const parsed = Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          transformHeader: header => header.trim()
        });
        
        if (parsed.errors.length > 0 && !(parsed.errors.length === 1 && parsed.errors[0].code === 'TooFewFields')) {
          console.warn(`Parsing errors in section "${sectionName}":`, parsed.errors);
        }

        if (sectionName === 'Accounts receivable') {
          const totalLine = lines.find(line => line.trim().startsWith('Total,'));
          if (totalLine) {
              const totalParts = totalLine.split(',');
              if (totalParts.length >= 5) {
                outstandingReceivables = parseFloat(totalParts[4].trim()) || 0;
              }
          }
        }

        const transactions = parsed.data.filter((row: unknown) => {
            const typedRow = row as Record<string, string>;
            return typedRow.Date && typedRow.Date.match(/^\d{4}-\d{2}-\d{2}/);
        }) as ParsedTransaction[];

        if (sectionName.startsWith('Bunq NL75BUNQ')) {
            rawBankTransactions = rawBankTransactions.concat(transactions);
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
        currentBalance: totalRevenue - totalExpenses,
        outstandingReceivables,
    };
};