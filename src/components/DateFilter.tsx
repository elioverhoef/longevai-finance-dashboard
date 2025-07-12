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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filter by month:</span>
      </div>
      
      <Select value={selectedMonth || "all"} onValueChange={(value) => onMonthChange(value === "all" ? null : value)}>
        <SelectTrigger className="w-48">
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
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {formatMonthDisplay(selectedMonth)}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={clearFilter}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        </div>
      )}
    </div>
  );
};