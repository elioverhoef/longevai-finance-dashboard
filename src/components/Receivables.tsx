import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { FinancialData } from '../types/financial';
import { AlertTriangle, DollarSign, Timer } from 'lucide-react';

interface ReceivablesProps {
  data: FinancialData;
}

export const Receivables: React.FC<ReceivablesProps> = ({ data }) => {
  const invoices = useMemo(() => data.receivables?.invoices || [], [data.receivables?.invoices]);
  const totalOutstanding = data.receivables?.totalOutstanding || 0;

  const byClient = useMemo(() => {
    const map = new Map<string, { outstanding: number; count: number }>();
    for (const inv of invoices) {
      const key = inv.client || 'Unknown';
      const existing = map.get(key) || { outstanding: 0, count: 0 };
      existing.outstanding += inv.outstandingAmount;
      existing.count += 1;
      map.set(key, existing);
    }
    return Array.from(map.entries()).map(([client, { outstanding, count }]) => ({ client, outstanding, count })).sort((a, b) => b.outstanding - a.outstanding);
  }, [invoices]);

  const aging = useMemo(() => {
    const buckets = { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90p: 0 };
    const today = new Date();
    for (const inv of invoices) {
      const days = inv.daysOutstanding ?? Math.floor((today.getTime() - new Date(inv.issueDate).getTime()) / (1000 * 3600 * 24));
      const amt = inv.outstandingAmount;
      if (days <= 0) buckets.current += amt;
      else if (days <= 30) buckets.d1_30 += amt;
      else if (days <= 60) buckets.d31_60 += amt;
      else if (days <= 90) buckets.d61_90 += amt;
      else buckets.d90p += amt;
    }
    return buckets;
  }, [invoices]);

  const overdue14 = invoices.filter(inv => inv.outstandingAmount > 0 && inv.daysOutstanding > 14);
  const overdue30 = invoices.filter(inv => inv.outstandingAmount > 0 && inv.daysOutstanding > 30);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4" /> Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">€{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground">Across {invoices.length} invoices</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Timer className="w-4 h-4" /> Aging</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 text-sm text-muted-foreground">
            <div className="grid grid-cols-2 gap-2">
              <div>0 days: <span className="font-semibold text-foreground">€{aging.current.toFixed(2)}</span></div>
              <div>1–30: <span className="font-semibold text-foreground">€{aging.d1_30.toFixed(2)}</span></div>
              <div>31–60: <span className="font-semibold text-foreground">€{aging.d31_60.toFixed(2)}</span></div>
              <div>61–90: <span className="font-semibold text-foreground">€{aging.d61_90.toFixed(2)}</span></div>
              <div>{">"}90: <span className="font-semibold text-foreground">€{aging.d90p.toFixed(2)}</span></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Top Clients by AR</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 text-sm">
            {byClient.slice(0, 5).map(c => (
              <div key={c.client} className="flex items-center justify-between py-1">
                <span className="truncate max-w-[60%]" title={c.client}>{c.client}</span>
                <span className="font-medium">€{c.outstanding.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {(overdue14.length > 0 || overdue30.length > 0) && (
        <Card className="border border-amber-300/40 bg-amber-50 dark:bg-amber-900/10">
          <CardContent className="p-4 text-sm">
            {overdue30.length > 0 && (
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-red-600">{overdue30.length} invoice(s) over 30 days outstanding</span>
              </div>
            )}
            {overdue14.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-amber-700">{overdue14.length} invoice(s) over 14 days outstanding</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base">Outstanding Invoices</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="text-right">Invoiced</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(inv => (
                  <TableRow key={inv.invoiceId}>
                    <TableCell>{inv.invoiceId}</TableCell>
                    <TableCell className="max-w-[220px] truncate" title={inv.client}>{inv.client}</TableCell>
                    <TableCell>{inv.issueDate}</TableCell>
                    <TableCell className="text-right">€{inv.invoicedAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">€{inv.paidAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={inv.outstandingAmount > 0 ? 'bg-warning/20 text-warning' : ''}>
                        €{inv.outstandingAmount.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{inv.daysOutstanding}</span>
                        {inv.outstandingAmount > 0 && (
                          <Badge variant={inv.daysOutstanding > 30 ? 'destructive' : 'secondary'} className={inv.daysOutstanding > 30 ? '' : 'bg-emerald-500/15 text-emerald-600'}>
                            {inv.daysOutstanding > 30 ? 'Expired' : 'Open'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 