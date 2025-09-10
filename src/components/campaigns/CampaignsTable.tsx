import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Campaign } from '@/lib/api';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, Pause, Play, Trash2 } from 'lucide-react';

interface CampaignsTableProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

export function CampaignsTable({ campaigns, isLoading }: CampaignsTableProps) {
  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      active: 'bg-green-100 text-green-800 hover:bg-green-100',
      paused: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      completed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    };
    
    return (
      <Badge 
        variant="secondary" 
        className={colors[status as keyof typeof colors] || colors.draft}
      >
        {status}
      </Badge>
    );
  };

  const calculateStats = (campaign: Campaign) => {
    const leads = campaign.leads || [];
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    const responseRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const progress = totalLeads > 0 ? (leads.filter(lead => 
      lead.status === 'contacted' || lead.status === 'responded' || lead.status === 'converted'
    ).length / totalLeads) * 100 : 0;
    
    return {
      totalLeads,
      convertedLeads,
      responseRate: Math.round(responseRate * 10) / 10,
      progress: Math.round(progress),
    };
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(6)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <h3 className="mt-4 text-lg font-semibold">No campaigns found</h3>
          <p className="text-muted-foreground">
            Create your first campaign to start managing leads.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Success Rate</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const stats = calculateStats(campaign);
            
            return (
              <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{campaign.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {campaign.description || 'No description'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(campaign.status)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{stats.totalLeads}</div>
                    <div className="text-muted-foreground">
                      {stats.convertedLeads} converted
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">{stats.responseRate}%</div>
                    <div className="text-muted-foreground">response rate</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Progress value={stats.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {stats.progress}% complete
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(campaign.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        {campaign.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Resume
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}