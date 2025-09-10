import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { LeadDetailSheet } from '@/components/leads/LeadDetailSheet';
import { LeadsFilters } from '@/components/leads/LeadsFilters';
import { AddLeadDialog } from '@/components/leads/AddLeadDialog';
import { useAppStore } from '@/stores/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { api, Lead } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Leads() {
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const { 
    selectedLead, 
    leadSheetOpen, 
    searchQuery, 
    leadStatusFilter, 
    setLeadSheetOpen 
  } = useAppStore();

  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads', searchQuery, leadStatusFilter],
    queryFn: () => api.getLeads({
      search: searchQuery || undefined,
      status: leadStatusFilter !== 'all' ? leadStatusFilter : undefined,
      limit: 50,
    }),
  });

  const { data: selectedLeadData } = useQuery({
    queryKey: ['lead', selectedLead],
    queryFn: () => selectedLead ? api.getLead(selectedLead) : null,
    enabled: !!selectedLead,
  });

  const handleLeadClick = (leadId: string) => {
    useAppStore.getState().setSelectedLead(leadId);
    setLeadSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setLeadSheetOpen(false);
    useAppStore.getState().setSelectedLead(null);
  };

  return (
    <AppLayout 
      title="Leads" 
      breadcrumbs={[{ label: 'Leads' }]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">All Leads</h2>
            <p className="text-muted-foreground">
              Manage and track all your leads across campaigns
            </p>
          </div>
          <Button onClick={() => setAddLeadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>

        {/* Filters */}
        <LeadsFilters />

        {/* Leads Table */}
        <LeadsTable
          leads={leads || []}
          isLoading={isLoading}
          onLeadClick={handleLeadClick}
        />

        {/* Lead Detail Sheet */}
        {selectedLeadData && (
          <LeadDetailSheet
            lead={selectedLeadData}
            open={leadSheetOpen}
            onClose={handleCloseSheet}
          />
        )}

        {/* Add Lead Dialog */}
        <AddLeadDialog
          open={addLeadOpen}
          onClose={() => setAddLeadOpen(false)}
        />
      </div>
    </AppLayout>
  );
}