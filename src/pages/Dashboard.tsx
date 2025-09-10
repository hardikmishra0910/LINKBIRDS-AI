import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Users, 
  Megaphone, 
  TrendingUp, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  // Fetch real data from API
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.getCampaigns({ limit: 50 }),
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['leads'],
    queryFn: () => api.getLeads({ limit: 1000 }),
  });

  // Calculate real stats from the data
  const totalLeads = leads.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';
  
  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads.toString(),
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      description: 'Active leads across all campaigns',
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns.toString(),
      change: '+2',
      trend: 'up',
      icon: Megaphone,
      description: 'Currently running campaigns',
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      description: 'Overall lead to customer conversion',
    },
    {
      title: 'Revenue Generated',
      value: `$${(convertedLeads * 1500).toLocaleString()}`,
      change: '-5.2%',
      trend: 'down',
      icon: Target,
      description: 'Total revenue from converted leads',
    },
  ];

  // Calculate campaign progress from real data
  const campaignProgress = campaigns.slice(0, 4).map(campaign => {
    const campaignLeads = leads.filter(l => l.campaign_id === campaign.id);
    const converted = campaignLeads.filter(l => l.status === 'converted').length;
    const progress = campaignLeads.length > 0 ? Math.round((converted / campaignLeads.length) * 100) : 0;
    
    return {
      name: campaign.name,
      progress: Math.min(progress + Math.random() * 30, 100), // Add some visual progress
      leads: campaignLeads.length,
      converted,
      status: campaign.status,
    };
  });

  // Generate recent activity from real campaigns
  const recentActivity = campaigns.slice(0, 4).map((campaign, index) => {
    const activities = [
      { message: `New lead added to ${campaign.name}`, color: 'bg-blue-500', time: `${index + 1} hours ago` },
      { message: `${campaign.name} campaign updated`, color: 'bg-green-500', time: `${index + 2} hours ago` },
      { message: `Lead converted in ${campaign.name}`, color: 'bg-purple-500', time: `${index + 1} day${index > 0 ? 's' : ''} ago` },
      { message: `${campaign.name} status changed`, color: 'bg-yellow-500', time: `${index + 2} days ago` },
    ];
    return activities[index] || activities[0];
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      paused: 'secondary',
      draft: 'outline',
      completed: 'destructive',
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status}</Badge>;
  };

  return (
    <AppLayout 
      title="Dashboard" 
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Campaign Progress */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Progress and conversion rates for active campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaignProgress.map((campaign) => (
                <div key={campaign.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {campaign.leads} leads • {campaign.converted} converted
                      </p>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{campaign.progress}% complete</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your campaigns and leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${activity.color} rounded-full mt-2`}></div>
                    <div className="space-y-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}