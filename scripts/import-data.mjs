import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const Papa = require('papaparse');

const CSV_FILE_PATH = path.resolve(process.cwd(), './public/export_202501..202512.csv');
const DB_STORAGE_PATH = path.resolve(process.cwd(), './public/sample-db.json');

// Import categorization config
const categoryKeywords = {
  'Software Development': ['cursor', 'ai powered ide', 'github', 'digital ocean', 'vercel', 'netlify', 'aws', 'azure', 'google cloud'],
  'Transportation': ['ovpay.nl', 'ov chipkaart', 'uber', 'taxi', 'transport', 'train', 'bus'],
  'Professional Services': ['accountant', 'lawyer', 'consultant', 'advisory'],
  'Mobile/Telecom': ['50plus mobiel', 'mobiel', 'telecom', 'phone', 'internet'],
  'Tax/Administration': ['taxpas', 'belasting', 'tax', 'administration'],
  'Equipment/Hardware': ['equipment', 'hardware', 'computer', 'laptop'],
  'Office Expenses': ['office', 'supplies', 'stationary'],
  'Marketing/Branding': ['pitch deck', 'branding', 'logo', 'marketing'],
  'Interest': ['bunq payday', 'interest', 'rente'],
  'Healthcare': ['medio zorg', 'healthcare', 'medical'],
  'Consulting Revenue': ['medicapital solutions', 'rebelsai', 'consulting', 'invoice'],
};

const projectKeywords = ['Medio Zorg', 'MediCapital Solutions', 'RebelsAI', 'Patrick Burgermeister'];

function normalizeDescription(desc) {
  return desc.replace(/\s+/g, ' ').replace(/\n/g, ' ').trim().toLowerCase();
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
  const sections = csvContent.split(/\n(?=[A-Za-z\s()0-9].*,,,,)/);
  let rawBankTransactions = [];
  let outstandingReceivables = 0;
  const ledgerCategoryMap = new Map();

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    const lines = section.split('\n');
    if (lines.length < 2) continue;

    const headerLine = lines[0];
    const sectionName = headerLine.split(',')[0].trim();
    
    // For Accounts receivable section, we need to include the Total line that might be in the next section
    let allSectionLines = lines;
    if (sectionName === 'Accounts receivable' && i + 1 < sections.length) {
      const nextSection = sections[i + 1].trim();
      const nextSectionLines = nextSection.split('\n');
      // Check if the first few lines of next section contain the Total line
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
    }

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

  const allTransactions = rawBankTransactions.map((t, index) => {
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
}

async function importSampleData() {
  console.log('🔄 Starting sample data import...');
  console.log('Sample CSV data is located at:', CSV_FILE_PATH);
  
  try {
    const stat = await fs.stat(CSV_FILE_PATH);
    console.log(`✅ CSV file found! Size: ${(stat.size / 1024).toFixed(2)} KB`);
    
    // Read and parse the CSV file
    const csvContent = await fs.readFile(CSV_FILE_PATH, 'utf-8');
    console.log('📖 Reading CSV content...');
    
    // Parse the financial data
    const financialData = parseCSVData(csvContent);
    console.log(`📊 Parsed ${financialData.allTransactions.length} transactions`);
    console.log(`💰 Total Revenue: €${financialData.totalRevenue.toFixed(2)}`);
    console.log(`💸 Total Expenses: €${financialData.totalExpenses.toFixed(2)}`);
    console.log(`📈 Net Profit: €${financialData.netProfit.toFixed(2)}`);
    console.log(`🏦 Outstanding Receivables: €${financialData.outstandingReceivables.toFixed(2)}`);
    
    // Save processed data to a JSON file for the frontend to load
    await fs.writeFile(DB_STORAGE_PATH, JSON.stringify(financialData, null, 2));
    console.log(`💾 Sample data saved to: ${DB_STORAGE_PATH}`);
    console.log('✅ Import complete! The application will load this data automatically.');
    
  } catch (error) {
    console.error('❌ Error during import:', error.message);
    console.error('Please ensure the export_202501..202512.csv file is in the public/ directory.');
    process.exit(1);
  }
}

importSampleData();