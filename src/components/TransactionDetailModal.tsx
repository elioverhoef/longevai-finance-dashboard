import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Transaction } from '../types/financial';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  transactions: Transaction[];
  categoryKeywords: Record<string, string[]>;
  onUpdateCategory: (transactionId: number, newCategory: string) => void;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);

function extractPayee(description: string): string {
  // Use the first line, up to the first number or special char, as payee/counterparty
  const firstLine = (description || '').split('\n')[0].trim();
  // Match consecutive characters until a digit or punctuation/grouping symbol is found
  const match = firstLine.match(/^[^\d,.;:!?@#()\[\]{}-]+/);
  return match ? match[0].trim() : firstLine;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  transactions,
  categoryKeywords,
  onUpdateCategory
}) => {
  const [search, setSearch] = useState('');
  const allCategories = Object.keys(categoryKeywords);

  // Group transactions by payee/counterparty
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    transactions.forEach(t => {
      const payee = extractPayee(t.description);
      if (!map.has(payee)) map.set(payee, []);
      map.get(payee)!.push(t);
    });
    return Array.from(map.entries())
      .map(([payee, txs]) => ({
        payee,
        transactions: txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        total: txs.reduce((sum, t) => sum + t.amount, 0),
        count: txs.length
      }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [transactions]);

  // Filter groups by search
  const filteredGroups = useMemo(() =>
    grouped.filter(g => g.payee.toLowerCase().includes(search.toLowerCase())),
    [grouped, search]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl h-[85vh] sm:h-[80vh] flex flex-col p-3 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg sm:text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {transactions.length} transactions found. Grouped by payee/counterparty. You can update the category for each transaction below.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-3 sm:mb-4 flex items-center gap-3">
          <Input
            placeholder="Search payee/counterparty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-80"
          />
        </div>
        <ScrollArea className="flex-grow pr-1 sm:pr-2">
          <div className="space-y-8">
            {filteredGroups.length === 0 && (
              <div className="text-center text-muted-foreground py-12">No matching payees found.</div>
            )}
            {filteredGroups.map(group => (
              <div key={group.payee} className="rounded-xl sm:rounded-2xl border border-muted bg-muted/10 shadow-sm p-0 group transition-all hover:shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-6 pt-3 pb-3 border-b border-muted/30 bg-gradient-to-r from-primary/10 to-primary/0 rounded-t-xl sm:rounded-t-2xl">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm sm:text-lg font-bold text-primary/90 uppercase flex-shrink-0">
                      {group.payee.slice(0,2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-base sm:text-lg text-foreground truncate">{group.payee}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{group.count} transaction{group.count > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right sm:text-right self-start sm:self-auto">
                    <span className={`font-bold text-lg sm:text-xl ${group.total < 0 ? 'text-primary' : 'text-success'}`}>{formatCurrency(group.total)}</span>
                  </div>
                </div>
                
                {/* Mobile Card Layout */}
                <div className="block sm:hidden space-y-3 p-3">
                  {group.transactions.map(t => (
                    <div key={t.id} className="border border-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-sm font-medium">{t.date || 'N/A'}</div>
                        <Badge className={`${t.amount > 0 ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'} text-xs`}>
                          {formatCurrency(t.amount)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {(t.description || '').split('\n')[0]}
                      </div>
                      <div className="pt-1">
                        <Select
                          value={t.category || 'Uncategorized'}
                          onValueChange={newCategory => onUpdateCategory(t.id, newCategory)}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {allCategories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                            <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table Layout */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Date</TableHead>
                        <TableHead className="text-xs sm:text-sm">Description</TableHead>
                        <TableHead className="text-xs sm:text-sm">Category</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.transactions.map(t => (
                        <TableRow key={t.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="whitespace-nowrap text-xs sm:text-sm">{t.date || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate text-xs sm:text-sm">{(t.description || '').split('\n')[0]}</TableCell>
                          <TableCell>
                            <Select
                              value={t.category || 'Uncategorized'}
                              onValueChange={newCategory => onUpdateCategory(t.id, newCategory)}
                            >
                              <SelectTrigger className="w-[140px] sm:w-[200px] h-8 text-xs">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {allCategories.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                                <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={`${t.amount > 0 ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'} text-xs`}>
                              {formatCurrency(t.amount)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};