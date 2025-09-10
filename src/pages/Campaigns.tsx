import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { CampaignsTable } from '@/components/campaigns/CampaignsTable';
import { CampaignsStats } from '@/components/campaigns/CampaignsStats';
import { CampaignsFilters } from '@/components/campaigns/CampaignsFilters';
import { AddCampaignDialog } from '@/components/campaigns/AddCampaignDialog';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAppStore } from '@/stores/useAppStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Campaigns() {
  const [addCampaignOpen, setAddCampaignOpen] = useState(false);
  const { campaignStatusFilter } = useAppStore();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns', campaignStatusFilter],
    queryFn: () => api.getCampaigns({
      status: campaignStatusFilter !== 'all' ? campaignStatusFilter : undefined,
      limit: 50,
    }),
  });

  return (
    <AppLayout 
      title="Campaigns" 
      breadcrumbs={[{ label: 'Campaigns' }]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
            <p className="text-muted-foreground">
              Create and manage your outreach campaigns
            </p>
          </div>
          <Button onClick={() => setAddCampaignOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Campaign Stats */}
        <CampaignsStats campaigns={campaigns || []} />

        {/* Filters */}
        <CampaignsFilters />

        {/* Campaigns Table */}
        <CampaignsTable
          campaigns={campaigns || []}
          isLoading={isLoading}
        />

        {/* Add Campaign Dialog */}
        <AddCampaignDialog
          open={addCampaignOpen}
          onClose={() => setAddCampaignOpen(false)}
        />
      </div>
    </AppLayout>
  );
}