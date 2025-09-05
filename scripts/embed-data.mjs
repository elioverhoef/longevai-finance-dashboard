// Build-time script to securely embed financial data into the frontend bundle
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(process.cwd(), './data');
const OUTPUT_FILE = path.resolve(process.cwd(), './src/data/embedded-data.ts');

async function embedData() {
  console.log('🔒 Embedding financial data securely...');
  
  try {
    // Read the sample data
    const sampleDataPath = path.join(DATA_DIR, 'sample-db.json');
    const sampleData = await fs.readFile(sampleDataPath, 'utf-8');
    
    // Read the DB version
    let dbVersion = Date.now().toString();
    try {
      const versionPath = path.join(DATA_DIR, 'db-version.txt');
      dbVersion = (await fs.readFile(versionPath, 'utf-8')).trim();
    } catch (e) {
      console.warn('No db-version.txt found, using current timestamp');
    }

    // Generate TypeScript file with embedded data
    const tsContent = `// AUTO-GENERATED FILE - DO NOT EDIT
// This file contains embedded financial data for production deployment

import { FinancialData } from '../types/financial';

// Database version for cache busting
export const DB_VERSION = '${dbVersion}';

// Embedded financial data
export const EMBEDDED_FINANCIAL_DATA: FinancialData = ${sampleData};

// Check if we're in production and data should be available
export const HAS_EMBEDDED_DATA = true;
`;

    // Write the embedded data file
    await fs.writeFile(OUTPUT_FILE, tsContent);
    
    console.log(`✅ Financial data embedded successfully`);
    console.log(`📊 Transactions: ${JSON.parse(sampleData).allTransactions?.length || 0}`);
    console.log(`💾 Output: ${OUTPUT_FILE}`);
    console.log(`🔖 Version: ${dbVersion}`);
    
  } catch (error) {
    console.error('❌ Error embedding data:', error.message);
    
    // Create a fallback empty data file
    const fallbackContent = `// AUTO-GENERATED FILE - DO NOT EDIT
// Fallback empty data file

import { FinancialData } from '../types/financial';

export const DB_VERSION = '${Date.now()}';
export const EMBEDDED_FINANCIAL_DATA: FinancialData | null = null;
export const HAS_EMBEDDED_DATA = false;
`;
    
    await fs.writeFile(OUTPUT_FILE, fallbackContent);
    console.log('💡 Created fallback empty data file');
  }
}

embedData();