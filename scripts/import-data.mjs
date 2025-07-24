import fs from 'fs/promises';
import path from 'path';

const CSV_FILE_PATH = path.resolve(process.cwd(), './public/export_202501..202512.csv');

async function importSampleData() {
  console.log('Sample CSV data is located at:', CSV_FILE_PATH);
  
  try {
    const stat = await fs.stat(CSV_FILE_PATH);
    console.log(`✅ CSV file found! Size: ${(stat.size / 1024).toFixed(2)} KB`);
    console.log('The application will automatically load this data on first run.');
    console.log('No additional import needed - the frontend handles CSV processing directly.');
  } catch (error) {
    console.error('❌ Sample CSV file not found at:', CSV_FILE_PATH);
    console.error('Please ensure the export_202501..202512.csv file is in the public/ directory.');
    process.exit(1);
  }
}

importSampleData();