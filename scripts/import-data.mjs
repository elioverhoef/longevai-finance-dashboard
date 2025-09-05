import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const Papa = require('papaparse');

const CSV_FILE_PATH = path.resolve(process.cwd(), './data/export_202501..202512.csv');
const DB_STORAGE_PATH = path.resolve(process.cwd(), './data/sample-db.json');

// Align project and category keywords with frontend
const categoryKeywords = {
  'Software & AI Tools': ['hubspot', 'slack', 'google', 'cursor', 'apollo', 'render', 'koyeb', 'claude', 'canva', 'moneybird', 'openai', 'anthropic', 'openrouter', 'twilio', 'coollabs', 'hetzner', 'godaddy', '50plus', 'facebk', 'monday.com'],
  'Salaries & Freelancers': ['catalin-stefan', 'diogo guedes', 'robijs dubas', 'salary', 'freelance', 'contractor', 'dubas', 'anyhouse', 'niculescu', 'harshit kedia'],
  'Taxes & Accounting': ['belastingdienst', 'taxpas', 'tax', 'accounting', 'kvk', 'digidentity', 'peter', 'kamer v koophandel', 'hoog16 juristen'],
  'Travel & Transport': ['nlov', 'ns groep', 'q park', 'ovpay', 'transavia', 'booking.com', 'bck*ns', 'ns'],
  'Office & Meetings': ['zettle', 'seats2meet', 'office', 'meeting', 'coworking', 'plnt', 'workplaces'],
  'Bank & Payment Fees': ['bunq', 'pay.nl', 'sumup', 'stripe', 'bank fee', 'transaction fee', 'mollie'],
  'Hardware & Assets': ['back market', 'laptop', 'hardware', 'equipment', 'computer'],
  'Client Revenue': ['medio zorg', 'rebelsai', 'burgermeister', 'qualevita', 'medicapital'],
  'Food & Groceries': ['albert heijn', 'ozan market', 'soupenzo', 'restaurant', 'griekse taverne', 'lisa', 'vialis', 'weena b.v.', 'dadawan', 'blushing blaricum'],
  'Miscellaneous': ['helios b.v.', 'geniusinvest', 'eq verhoef', '50plus mobiel', 'genius invest']
};

const projectKeywords = ['Medio Zorg', 'Qualevita', 'RebelsAI', 'Patrick Burgermeister', 'V&P Vastgoed', 'RegenEra Ventures', 'Curista', 'MatrixMeesters', 'Astralift', 'MediCapital Solutions'];

function normalizeDescription(desc) {
  return desc.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim().toLowerCase();
}

function findClientName(text) {
  const t = (text || '').toLowerCase();
  for (const name of projectKeywords) {
    if (t.includes(name.toLowerCase())) return name;
  }
  // Handle common alternate/name order variants
  if (t.includes('burgermeister patrick')) return 'Patrick Burgermeister';
  return undefined;
}

function categorizeTransaction(description, ledgerCategory) {
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
    // Map known ledger section names to canonical categories
    const lc = normalizedLedgerCategory.toLowerCase();
    if (lc.startsWith('bank charges')) return 'Bank & Payment Fees';
    if (lc.startsWith('payable vat') || lc.startsWith('sales tax')) return 'Taxes & Accounting';
    if (lc.startsWith('uncategorized income') || lc.startsWith('revenue')) return 'Client Revenue';
    if (lc.startsWith('office') || lc.includes('meeting')) return 'Office & Meetings';
    return normalizedLedgerCategory;
  }

  return 'Uncategorized';
}

function extractProject(description) {
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
}

function parseCSVData(csvContent) {
  // Split only at section headers (not at Total lines)
  const sections = csvContent.split(/\n(?=(?!Total,)[A-Za-z][^\n]*,,,,)/);
  let rawBankTransactions = [];
  let outstandingReceivables = 0;
  let actualBankBalance = 0;
  let larsPaymentAmount = 0; // Track Lars payment to add to balance
  const ledgerCategoryMap = new Map();
  const receivableInvoices = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    const lines = section.split('\n');
    if (lines.length < 2) continue;

    const headerLine = lines[0];
    const sectionName = headerLine.split(',')[0].trim();

    // For Accounts receivable section, include the Total line that might appear early in next section
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

    const transactions = parsed.data.filter((row) => {
      return row.Date && row.Date.match(/^\d{4}-\d{2}-\d{2}/);
    });

    if (sectionName === 'Accounts receivable') {
      const totalLine = allSectionLines.find(line => line.trim().startsWith('Total,'));
      if (totalLine) {
        const totalParts = totalLine.split(',');
        if (totalParts.length >= 5) {
          const totalValue = totalParts[4].trim();
          if (totalValue && totalValue !== '') {
            outstandingReceivables = parseFloat(totalValue) || 0;
          }
        }
      }
      // Build invoice entries and match payments
      // First pass: create invoice records
      const invoiceMap = new Map();
      for (const row of transactions) {
        const ref = row.Reference || '';
        if (ref.startsWith('INV ')) {
          const desc = (row.Description || '').replace(/\n/g, ' ');
          const idMatch = `${ref} ${desc}`.match(/\b(\d{4}-\d{4})\b/);
          const invoiceId = idMatch ? idMatch[1] : '';
          if (!invoiceId) continue;
          const amount = parseFloat(row.Amount) || 0;
          const clientDetected = findClientName(`${ref} ${desc}`);
          const clientFromRef = ref.split(' - ').pop() || 'Unknown';
          const client = clientDetected || clientFromRef || 'Unknown';
          // Mark Lars payment as paid
          const isPaidLarsInvoice = client.toLowerCase().includes('lars arendsen');
          const paidAmount = isPaidLarsInvoice ? amount : 0;
          const outstandingAmount = isPaidLarsInvoice ? 0 : amount;
          
          // Track Lars payment amount to add to balance
          if (isPaidLarsInvoice) {
            larsPaymentAmount += amount;
          }
          
          invoiceMap.set(invoiceId, {
            invoiceId,
            client,
            issueDate: row.Date,
            invoicedAmount: amount,
            paidAmount: paidAmount,
            outstandingAmount: outstandingAmount,
            daysOutstanding: Math.floor((Date.now() - new Date(row.Date).getTime()) / (1000 * 3600 * 24)),
          });
        }
      }
      // Second pass: apply payments (TRA, PAY)
      for (const row of transactions) {
        const ref = row.Reference || '';
        const isPayment = ref.startsWith('TRA ') || ref.startsWith('PAY ');
        if (!isPayment) continue;
        const desc = (row.Description || '').replace(/\n/g, ' ');
        const idMatch = `${ref} ${desc}`.match(/\b(\d{4}-\d{4})\b/);
        const paymentAmount = Math.abs(parseFloat(row.Amount) || 0);
        if (idMatch) {
          const invoiceId = idMatch[1];
          const inv = invoiceMap.get(invoiceId);
          if (inv) {
            inv.paidAmount += paymentAmount;
            inv.outstandingAmount = Math.max(0, inv.invoicedAmount - inv.paidAmount);
          }
        } else {
          // Fallback: match by client then by exact amount, otherwise FIFO
          const client = findClientName(`${ref} ${desc}`);
          if (client) {
            let remaining = paymentAmount;
            // First: exact amount match against any single outstanding invoice
            const exact = Array.from(invoiceMap.values()).find(inv => inv.client === client && Math.abs(inv.outstandingAmount - remaining) < 0.01);
            if (exact) {
              exact.paidAmount += remaining;
              exact.outstandingAmount = Math.max(0, exact.invoicedAmount - exact.paidAmount);
              remaining = 0;
            }
            // Then FIFO for any remainder
            const candidates = Array.from(invoiceMap.values()).filter(inv => inv.client === client && inv.outstandingAmount > 0).sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate));
            for (const inv of candidates) {
              if (remaining <= 0) break;
              const apply = Math.min(inv.outstandingAmount, remaining);
              inv.paidAmount += apply;
              inv.outstandingAmount = Math.max(0, inv.invoicedAmount - inv.paidAmount);
              remaining -= apply;
            }
          }
        }
      }
      receivableInvoices.push(...Array.from(invoiceMap.values()));
    }

    if (sectionName.startsWith('Bunq NL75BUNQ')) {
      rawBankTransactions = rawBankTransactions.concat(transactions);
      const totalLine = allSectionLines.find(line => line.trim().startsWith('Total,'));
      if (totalLine) {
        const totalParts = totalLine.split(',');
        if (totalParts.length >= 5) {
          const totalValue = totalLine.split(',')[4].trim();
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

  const allTransactions = rawBankTransactions
    .filter(t => {
      const amount = parseFloat(t.Amount) || 0;
      return amount !== 0; // Filter out zero-amount transactions
    })
    .map((t, index) => {
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
  const netProfit = totalRevenue - totalExpenses;

  return {
    allTransactions,
    totalRevenue,
    totalExpenses,
    netProfit,
    currentBalance: actualBankBalance + larsPaymentAmount,
    outstandingReceivables,
    receivables: {
      totalOutstanding: receivableInvoices.reduce((s, inv) => s + Math.max(0, inv.outstandingAmount), 0),
      invoices: receivableInvoices.filter(inv => inv.outstandingAmount > 0)
    }
  };
}

async function importSampleData() {
  console.log('🔄 Starting sample data import...');
  console.log('Sample CSV data is located at:', CSV_FILE_PATH);
  
  try {
    const stat = await fs.stat(CSV_FILE_PATH);
    console.log(`✅ CSV file found! Size: ${(stat.size / 1024).toFixed(2)} KB`);
    
    const csvContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    console.log('📖 Reading CSV content...');
    
    const financialData = parseCSVData(csvContent);
    console.log(`📊 Parsed ${financialData.allTransactions.length} transactions`);
    console.log(`💰 Total Revenue: €${financialData.totalRevenue.toFixed(2)}`);
    console.log(`💸 Total Expenses: €${financialData.totalExpenses.toFixed(2)}`);
    console.log(`📈 Net Profit: €${financialData.netProfit.toFixed(2)}`);
    console.log(`🏦 Current Balance (Bunq Total): €${financialData.currentBalance.toFixed(2)}`);
    console.log(`📬 Outstanding Receivables: €${financialData.outstandingReceivables.toFixed(2)}`);
    
    await fs.writeFile(DB_STORAGE_PATH, JSON.stringify(financialData, null, 2));
    console.log(`💾 Sample data saved to: ${DB_STORAGE_PATH}`);
    console.log('✅ Import complete! The application will load this data automatically.');
    
    // Write a version marker for the frontend to bust caches (dev helper)
    try {
      const versionFile = path.resolve(process.cwd(), './data/db-version.txt');
      await fs.writeFile(versionFile, `${Date.now()}`);
      console.log('🔖 DB version bumped.');
    } catch {}
    
  } catch (error) {
    console.error('❌ Error during import:', error.message);
    console.error('Please ensure the export_202501..202512.csv file is in the data/ directory.');
    process.exit(1);
  }
}

importSampleData();