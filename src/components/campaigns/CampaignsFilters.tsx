import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/stores/useAppStore';
import { Filter, X } from 'lucide-react';

export function CampaignsFilters() {
  const { 
    campaignStatusFilter, 
    setCampaignStatusFilter,
  } = useAppStore();

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
  ];

  const hasActiveFilters = campaignStatusFilter !== 'all';

  const resetFilters = () => {
    setCampaignStatusFilter('all');
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-4">
        {/* Status Filter */}
        <Select value={campaignStatusFilter} onValueChange={setCampaignStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {campaignStatusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {campaignStatusFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setCampaignStatusFilter('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}