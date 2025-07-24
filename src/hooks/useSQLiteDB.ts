import { useState, useEffect, useCallback } from 'react';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { Transaction, FinancialData } from '../types/financial';

const DB_NAME = 'longevai_financial_data_v2';

export const useSQLiteDB = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [SQL, setSQL] = useState<SqlJsStatic | null>(null);

  // Initialize SQLite
  useEffect(() => {
    const initDB = async () => {
      try {
        const sqlPromise = await initSqlJs({
          locateFile: (file: string) => `/${file}`
        });
        setSQL(sqlPromise);

        // Try to load existing database from localStorage
        const existingData = localStorage.getItem(DB_NAME);
        let database: Database;

        if (existingData) {
          // Load existing database from base64 string
          const uint8Array = new Uint8Array(
            atob(existingData).split('').map(char => char.charCodeAt(0))
          );
          database = new sqlPromise.Database(uint8Array);
        } else {
          // Create new database
          database = new sqlPromise.Database();
          
          // Create tables
          database.run(`
            CREATE TABLE IF NOT EXISTS transactions (
              id INTEGER PRIMARY KEY,
              date TEXT NOT NULL,
              reference TEXT,
              description TEXT,
              vat TEXT,
              amount REAL NOT NULL,
              category TEXT,
              project TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          database.run(`
            CREATE TABLE IF NOT EXISTS financial_summary (
              id INTEGER PRIMARY KEY,
              total_revenue REAL NOT NULL,
              total_expenses REAL NOT NULL,
              net_profit REAL NOT NULL,
              current_balance REAL NOT NULL,
              outstanding_receivables REAL NOT NULL,
              last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);

          // Create indexes for better performance
          database.run(`
            CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
            CREATE INDEX IF NOT EXISTS idx_transactions_project ON transactions(project);
            CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
          `);
        }

        setDb(database);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize SQLite:', error);
      }
    };

    initDB();
  }, []);

  // Save database to localStorage
  const saveDatabase = useCallback(() => {
    if (!db) return;
    
    try {
      const data = db.export();
      const base64String = btoa(String.fromCharCode(...data));
      localStorage.setItem(DB_NAME, base64String);
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }, [db]);

  // Save financial data to SQLite
  const saveFinancialData = useCallback(async (financialData: FinancialData) => {
    if (!db || !isReady) return;

    try {
      db.run('BEGIN TRANSACTION;');
      
      // Clear existing data
      db.run('DELETE FROM transactions');
      db.run('DELETE FROM financial_summary');

      // Insert transactions
      const stmt = db.prepare(`
        INSERT INTO transactions (id, date, reference, description, vat, amount, category, project)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      financialData.allTransactions.forEach(transaction => {
        stmt.run([
          transaction.id,
          transaction.date,
          transaction.reference,
          transaction.description,
          transaction.vat,
          transaction.amount,
          transaction.category,
          transaction.project || null
        ]);
      });
      stmt.free();

      // Insert financial summary
      db.run(`
        INSERT INTO financial_summary (id, total_revenue, total_expenses, net_profit, current_balance, outstanding_receivables) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [1, financialData.totalRevenue, financialData.totalExpenses, financialData.netProfit, financialData.currentBalance, financialData.outstandingReceivables]);

      db.run('COMMIT;');
      saveDatabase();
    } catch (error) {
      db.run('ROLLBACK;');
      console.error('Failed to save financial data:', error);
      throw error;
    }
  }, [db, isReady, saveDatabase]);

  // Load financial data from SQLite
  const loadFinancialData = useCallback((): FinancialData | null => {
    if (!db || !isReady) return null;

    try {
      // Load transactions
      const transactionResults = db.exec('SELECT * FROM transactions ORDER BY date DESC');
      const summaryResults = db.exec('SELECT * FROM financial_summary ORDER BY last_updated DESC LIMIT 1');

      if (transactionResults.length === 0) {
        return null; // No data found
      }

      const transactions: Transaction[] = transactionResults[0].values.map(row => ({
        id: row[0] as number,
        date: row[1] as string,
        reference: row[2] as string,
        description: row[3] as string,
        vat: row[4] as string,
        amount: row[5] as number,
        category: row[6] as string,
        project: row[7] as string | undefined
      }));

      let summary = null;
      if (summaryResults.length > 0) {
        const summaryRow = summaryResults[0].values[0];
        summary = {
          totalRevenue: summaryRow[1] as number,
          totalExpenses: summaryRow[2] as number,
          netProfit: summaryRow[3] as number,
          currentBalance: summaryRow[4] as number,
          outstandingReceivables: summaryRow[5] as number
        };
      }

      return {
        allTransactions: transactions,
        totalRevenue: summary?.totalRevenue || 0,
        totalExpenses: summary?.totalExpenses || 0,
        netProfit: summary?.netProfit || 0,
        currentBalance: summary?.currentBalance || 0,
        outstandingReceivables: summary?.outstandingReceivables || 0
      };
    } catch (error) {
      console.error('Failed to load financial data:', error);
      return null;
    }
  }, [db, isReady]);

  // Update transaction category
  const updateTransactionCategory = useCallback((transactionId: number, newCategory: string) => {
    if (!db || !isReady) return;

    try {
      db.run(
        'UPDATE transactions SET category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newCategory, transactionId]
      );
      saveDatabase();
      console.log(`Updated transaction ${transactionId} category to ${newCategory}`);
    } catch (error) {
      console.error('Failed to update transaction category:', error);
    }
  }, [db, isReady, saveDatabase]);

  // Clear all data
  const clearDatabase = useCallback(async () => {
    if (!db || !isReady) return;

    try {
      db.run('DELETE FROM transactions');
      db.run('DELETE FROM financial_summary');
      saveDatabase();
    } catch (error) {
      console.error('Failed to clear database:', error);
      throw error;
    }
  }, [db, isReady, saveDatabase]);

  return {
    isReady,
    saveFinancialData,
    loadFinancialData,
    updateTransactionCategory,
    clearDatabase
  };
};