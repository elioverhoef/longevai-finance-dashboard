import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Transaction } from '../types/financial';
import { Badge } from './ui/badge';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  transactions: Transaction[];
  categoryKeywords: Record<string, string[]>;
  onUpdateCategory: (transactionId: number, newCategory: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  transactions,
  categoryKeywords,
  onUpdateCategory
}) => {
  const allCategories = Object.keys(categoryKeywords);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            {transactions.length} transactions found. You can update the category for each transaction below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.filter(t => t && t.id !== undefined).map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="whitespace-nowrap">{t.date || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">{(t.description || '').split('\n')[0]}</TableCell>
                  <TableCell>
                    <Select
                      value={t.category || 'Uncategorized'}
                      onValueChange={(newCategory) => onUpdateCategory(t.id, newCategory)}
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
                    <Badge className={t.amount > 0 ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}>{formatCurrency(t.amount)}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};