import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Transaction, FinancialData, CategoryData, ProjectData, MonthlyData } from '../types/financial';

// Sample data based on the CSV provided
const sampleCSVData = `Accounts receivable,,,,
Date,Reference,Description,VAT,Amount
2025-07-02,INV 2025-0009 - RebelsAI B.V.,2025-0009,,5324
2025-06-16,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0007 RF33NHVC7H3A",,-4235
2025-06-16,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0008 RF57WPG6UF7S",,-2117.5
2025-06-03,INV 2025-0007 - Medio Zorg B.V.,2025-0007,,4235
2025-06-03,INV 2025-0008 - Medio Zorg B.V.,2025-0008,,2117.5
2025-05-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Burgermeister Patrick CH56 0839 8064 2115 0510 4
Pitch deck / Branding / Logo",,-1815
2025-05-02,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
Invoice 2025-0006",,-8470
2025-05-01,PAY 2025-0005 - ,,,14822.5
2025-05-01,PAY 2025-0004 - ,,,-14822.5
2025-05-01,INV 2025-0004 - Medio Zorg B.V.,2025-0004,,14822.5
2025-05-01,INV 2025-0005 - Medio Zorg B.V.,2025-0005,,-14822.5
2025-05-01,INV 2025-0006 - Medio Zorg B.V.,2025-0006,,8470
2025-04-26,INV 2025-0003 - Patrick Burgermeister,2025-0003,,1815
2025-03-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0002 RF12JDZ3CVMN",,-4840
2025-03-11,INV 2025-0002 - Medio Zorg B.V.,2025-0002,,4840
2025-02-12,TRA Bunq NL75BUNQ2145840184 (Ponto),"Medio Zorg B.V. NL15 INGB 0106 2158 17
2025-0001 RF31YKQC4JYP",,-6352.5
2025-02-11,INV 2025-0001 - Medio Zorg B.V.,2025-0001,,6352.5
2024-12-31,Opening balance of Accounts receivable,,,0
Total,,,,5324
Bunq NL75BUNQ2145840184 (10201),,,,
Date,Reference,Description,VAT,Amount
2025-07-10,TRA Bunq NL75BUNQ2145840184 (Ponto),"bunq NL13 BUNQ 2094 1225 49
bunq Payday 2025-07-10 EUR",,0.22
2025-07-10,TRA Bunq NL75BUNQ2145840184 (Ponto),"HubSpot Netherlands B.
HubSpot Netherlands B. Schiphol, NL
",,-18.15
2025-07-09,TRA Bunq NL75BUNQ2145840184 (Ponto),"SumUp  *Midi
SumUp  *Midi Leiden, NL
",,-8.07
2025-07-09,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVLD5D6L8Y4X95Z7
NLOVLD5D6L8Y4X95Z7 www.ovpay.nl, NL
",,-8.3
2025-07-09,TRA Bunq NL75BUNQ2145840184 (Ponto),"NLOVGY5BE94GQ9QJLP
NLOVGY5BE94GQ9QJLP www.ovpay.nl, NL
",,-8.3
2025-07-08,TRA Bunq NL75BUNQ2145840184 (Ponto),"Moneybird B.V. NL65 ADYB 2006 0111 62
Moneybird B.V. 2025-472188 MoneyBird B.V.",,-4.84
2025-07-06,TRA Bunq NL75BUNQ2145840184 (Ponto),"CURSOR USAGE  JUN
CURSOR USAGE  JUN NEW YORK, US
0.60 USD, 1 USD = 0.85000 EUR",,-0.51
2025-07-05,TRA Bunq NL75BUNQ2145840184 (Ponto),"Order qKrg4EOvJMMY - M
Order qKrg4EOvJMMY - M Enschede, NL
",,-16.94
2025-07-03,TRA Bunq NL75BUNQ2145840184 (Ponto),"RENDER.COM
RENDER.COM SAN FRANCISCO, US
25.25 USD, 1 USD = 0.85584 EUR",,-21.61`;

// Category mapping based on description patterns
const categoryMappings = {
  'Subscriptions & AI Tools': [
    'hubspot', 'slack', 'google', 'cursor', 'apollo', 'render', 'koyeb', 
    'claude', 'canva', 'moneybird', 'openai', 'anthropic'
  ],
  'Salaries & Freelancers': [
    'catalin', 'stefan', 'diogo', 'guedes', 'leal', 'robijs', 'dubass', 
    'salary', 'freelance', 'contractor'
  ],
  'Taxes & Accounting': [
    'belastingdienst', 'taxpas', 'tax', 'accounting', 'kvk'
  ],
  'Travel & Transport': [
    'nlov', 'ns groep', 'q park', 'ovpay', 'train', 'parking', 'uber'
  ],
  'Office & Meetings': [
    'zettle', 'seats2meet', 'anyhouse', 'office', 'meeting', 'coworking'
  ],
  'Bank & Payment Fees': [
    'bunq', 'pay.nl', 'sumup', 'stripe', 'bank fee', 'transaction fee'
  ],
  'Marketing & Branding': [
    'facebk', 'facebook', 'apollo', 'marketing', 'branding', 'advertising'
  ],
  'Food & Events': [
    'albert heijn', 'soupenzo', 'restaurant', 'catering', 'lunch'
  ],
  'Hardware & Assets': [
    'back market', 'laptop', 'hardware', 'equipment', 'computer'
  ],
  'Client Revenue': [
    'medio zorg', 'qualevita', 'rebels', 'invoice', 'inv '
  ]
};

export const useFinancialData = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categorizeTransaction = (description: string): string => {
    const desc = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categoryMappings)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }
    
    return 'Miscellaneous';
  };

  const isRegularTransaction = (transactions: Transaction[], description: string): boolean => {
    const similar = transactions.filter(t => 
      t.description.toLowerCase().includes(description.toLowerCase().split(' ')[0])
    );
    return similar.length > 1;
  };

  const extractProject = (description: string): string | undefined => {
    const desc = description.toLowerCase();
    if (desc.includes('medio zorg')) return 'Medio Zorg';
    if (desc.includes('qualevita')) return 'Qualevita';
    if (desc.includes('rebels')) return 'RebelsAI';
    if (desc.includes('patrick') || desc.includes('burgermeister')) return 'Patrick Burgermeister';
    return undefined;
  };

  const parseCSV = useCallback(async (csvContent: string) => {
    setLoading(true);
    setError(null);

    try {
      const lines = csvContent.split('\n');
      let currentSection = '';
      const accountsReceivable: Transaction[] = [];
      const bankTransactions: Transaction[] = [];
      let allTransactions: Transaction[] = [];

      let i = 0;
      while (i < lines.length) {
        const line = lines[i].trim();
        
        if (line.includes('Accounts receivable')) {
          currentSection = 'accounts';
          i += 2; // Skip header
          continue;
        }
        
        if (line.includes('Bunq') && line.includes('10201')) {
          currentSection = 'bank';
          i += 2; // Skip header
          continue;
        }

        if (line && !line.includes('Total') && !line.includes('Opening balance')) {
          const parsed = Papa.parse(line, { header: false });
          if (parsed.data && parsed.data[0] && Array.isArray(parsed.data[0])) {
            const row = parsed.data[0] as string[];
            
            if (row.length >= 5 && row[0] && row[0].match(/\d{4}-\d{2}-\d{2}/)) {
              const amount = parseFloat(row[4]) || 0;
              const transaction: Transaction = {
                date: row[0],
                reference: row[1] || '',
                description: row[2] || '',
                vat: row[3] || '',
                amount: amount
              };

              if (currentSection === 'accounts') {
                accountsReceivable.push(transaction);
              } else if (currentSection === 'bank') {
                bankTransactions.push(transaction);
              }

              allTransactions.push(transaction);
            }
          }
        }
        i++;
      }

      // Categorize and analyze transactions
      allTransactions = allTransactions.map(t => ({
        ...t,
        category: categorizeTransaction(t.description),
        isRegular: isRegularTransaction(allTransactions, t.description),
        project: extractProject(t.description)
      }));

      const revenue = allTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = Math.abs(allTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + t.amount, 0));

      const financialData: FinancialData = {
        accountsReceivable: accountsReceivable.map(t => ({
          ...t,
          category: categorizeTransaction(t.description),
          isRegular: isRegularTransaction(allTransactions, t.description),
          project: extractProject(t.description)
        })),
        bankTransactions: bankTransactions.map(t => ({
          ...t,
          category: categorizeTransaction(t.description),
          isRegular: isRegularTransaction(allTransactions, t.description),
          project: extractProject(t.description)
        })),
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit: revenue - expenses
      };

      setData(financialData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSampleData = useCallback(() => {
    parseCSV(sampleCSVData);
  }, [parseCSV]);

  const uploadCSV = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseCSV(content);
    };
    reader.readAsText(file);
  }, [parseCSV]);

  const getCategoryData = useCallback((): CategoryData[] => {
    if (!data) return [];

    const allTransactions = [...data.accountsReceivable, ...data.bankTransactions];
    const categoryMap = new Map<string, { amount: number; transactions: Transaction[] }>();

    allTransactions.forEach(t => {
      const category = t.category || 'Miscellaneous';
      const existing = categoryMap.get(category) || { amount: 0, transactions: [] };
      categoryMap.set(category, {
        amount: existing.amount + Math.abs(t.amount),
        transactions: [...existing.transactions, t]
      });
    });

    const total = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0);

    return Array.from(categoryMap.entries()).map(([name, { amount, transactions }]) => ({
      name,
      amount,
      percentage: (amount / total) * 100,
      transactions,
      isExpense: transactions.some(t => t.amount < 0)
    })).sort((a, b) => b.amount - a.amount);
  }, [data]);

  const getProjectData = useCallback((): ProjectData[] => {
    if (!data) return [];

    const allTransactions = [...data.accountsReceivable, ...data.bankTransactions];
    const projectMap = new Map<string, Transaction[]>();

    allTransactions.forEach(t => {
      if (t.project) {
        const existing = projectMap.get(t.project) || [];
        projectMap.set(t.project, [...existing, t]);
      }
    });

    return Array.from(projectMap.entries()).map(([name, transactions]) => {
      const revenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
      
      return {
        name,
        revenue,
        expenses,
        netProfit: revenue - expenses,
        weeks: Math.ceil(transactions.length / 4), // Estimate based on transaction frequency
        transactions
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const getMonthlyData = useCallback((): MonthlyData[] => {
    if (!data) return [];

    const allTransactions = [...data.accountsReceivable, ...data.bankTransactions];
    const monthlyMap = new Map<string, { revenue: number; expenses: number }>();

    allTransactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      const existing = monthlyMap.get(month) || { revenue: 0, expenses: 0 };
      
      if (t.amount > 0) {
        existing.revenue += t.amount;
      } else {
        existing.expenses += Math.abs(t.amount);
      }
      
      monthlyMap.set(month, existing);
    });

    return Array.from(monthlyMap.entries())
      .map(([month, { revenue, expenses }]) => ({
        month,
        revenue,
        expenses,
        netProfit: revenue - expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [data]);

  return {
    data,
    loading,
    error,
    parseCSV,
    loadSampleData,
    uploadCSV,
    getCategoryData,
    getProjectData,
    getMonthlyData
  };
};