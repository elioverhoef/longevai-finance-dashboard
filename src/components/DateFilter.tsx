import React from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface DateFilterProps {
  selectedMonth: string | null;
  availableMonths: string[];
  onMonthChange: (month: string | null) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
  selectedMonth,
  availableMonths,
  onMonthChange,
}) => {
  const formatMonthDisplay = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const clearFilter = () => {
    onMonthChange(null);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Filter by month:</span>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Select value={selectedMonth || "all"} onValueChange={(value) => onMonthChange(value === "all" ? null : value)}>
          <SelectTrigger className="w-full sm:w-48 dark:bg-zinc-800 dark:text-zinc-100">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {availableMonths.map((month) => (
              <SelectItem key={month} value={month}>
                {formatMonthDisplay(month)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedMonth && (
          <Badge variant="secondary" className="flex items-center gap-1 dark:bg-zinc-800 dark:text-zinc-100 flex-shrink-0">
            <span className="hidden sm:inline">{formatMonthDisplay(selectedMonth)}</span>
            <span className="sm:hidden">Active</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={clearFilter}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        )}
      </div>
    </div>
  );
};