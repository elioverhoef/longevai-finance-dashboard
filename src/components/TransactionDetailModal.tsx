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
  // Remove unnecessary escapes for ( ) [ ]
  const match = firstLine.match(/^[^\d,.;:!?@#\-()\]}]+/);
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
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            {transactions.length} transactions found. Grouped by payee/counterparty. You can update the category for each transaction below.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 flex items-center gap-3">
          <Input
            placeholder="Search payee/counterparty..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-80"
          />
        </div>
        <ScrollArea className="flex-grow pr-2">
          <div className="space-y-8">
            {filteredGroups.length === 0 && (
              <div className="text-center text-muted-foreground py-12">No matching payees found.</div>
            )}
            {filteredGroups.map(group => (
              <div key={group.payee} className="rounded-2xl border border-muted bg-muted/10 shadow-sm p-0 group transition-all hover:shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-6 pt-3 pb-3 border-b border-muted/30 bg-gradient-to-r from-primary/10 to-primary/0 rounded-t-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary/90 uppercase">
                      {group.payee.slice(0,2)}
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-foreground">{group.payee}</div>
                      <div className="text-sm text-muted-foreground">{group.count} transaction{group.count > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-xl ${group.total < 0 ? 'text-primary' : 'text-success'}`}>{formatCurrency(group.total)}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.transactions.map(t => (
                        <TableRow key={t.id} className="hover:bg-muted/40 transition-colors">
                          <TableCell className="whitespace-nowrap">{t.date || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{(t.description || '').split('\n')[0]}</TableCell>
                          <TableCell>
                            <Select
                              value={t.category || 'Uncategorized'}
                              onValueChange={newCategory => onUpdateCategory(t.id, newCategory)}
                            >
                              <SelectTrigger className="w-[200px]">
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
                            <Badge className={t.amount > 0 ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}>{formatCurrency(t.amount)}</Badge>
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