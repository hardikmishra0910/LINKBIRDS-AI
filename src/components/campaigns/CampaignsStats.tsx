import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Campaign } from '@/lib/api';
import { TrendingUp, Users, Target, Activity } from 'lucide-react';

interface CampaignsStatsProps {
  campaigns: Campaign[];
}

export function CampaignsStats({ campaigns }: CampaignsStatsProps) {
  const calculateOverallStats = () => {
    let totalLeads = 0;
    let convertedLeads = 0;
    let activeCampaigns = 0;
    let totalContacted = 0;

    campaigns.forEach(campaign => {
      if (campaign.status === 'active') {
        activeCampaigns++;
      }
      
      const leads = campaign.leads || [];
      totalLeads += leads.length;
      
      leads.forEach(lead => {
        if (lead.status === 'converted') {
          convertedLeads++;
        }
        if (lead.status === 'contacted' || lead.status === 'responded' || lead.status === 'converted') {
          totalContacted++;
        }
      });
    });

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const contactRate = totalLeads > 0 ? (totalContacted / totalLeads) * 100 : 0;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalLeads,
      convertedLeads,
      conversionRate: Math.round(conversionRate * 10) / 10,
      contactRate: Math.round(contactRate * 10) / 10,
    };
  };

  const stats = calculateOverallStats();

  const statCards = [
    {
      title: 'Total Campaigns',
      value: stats.totalCampaigns,
      description: `${stats.activeCampaigns} currently active`,
      icon: Activity,
      change: null,
    },
    {
      title: 'Total Leads',
      value: stats.totalLeads.toLocaleString(),
      description: 'Across all campaigns',
      icon: Users,
      change: null,
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      description: `${stats.convertedLeads} leads converted`,
      icon: Target,
      change: '+2.1%',
    },
    {
      title: 'Contact Rate',
      value: `${stats.contactRate}%`,
      description: 'Leads successfully contacted',
      icon: TrendingUp,
      change: '+5.3%',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
            {stat.change && (
              <div className="flex items-center space-x-1 text-xs text-green-500 mt-1">
                <span>{stat.change}</span>
                <span className="text-muted-foreground">from last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}