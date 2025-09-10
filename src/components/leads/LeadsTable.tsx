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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Lead } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Building2, Mail } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onLeadClick: (leadId: string) => void;
}

export function LeadsTable({ leads, isLoading, onLeadClick }: LeadsTableProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      contacted: 'default',
      responded: 'outline',
      converted: 'destructive',
    } as const;
    
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      contacted: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      responded: 'bg-green-100 text-green-800 hover:bg-green-100',
      converted: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    };
    
    return (
      <Badge 
        variant="secondary" 
        className={colors[status as keyof typeof colors] || colors.pending}
      >
        {status}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(8)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No leads found</h3>
          <p className="text-muted-foreground">
            No leads match your current search criteria.
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
            <TableHead>Lead</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onLeadClick(lead.id)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(lead.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{lead.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.email}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {lead.company && (
                    <>
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{lead.company}</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {lead.campaign?.name || 'No Campaign'}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(lead.status)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {lead.last_contact_date 
                  ? formatDistanceToNow(new Date(lead.last_contact_date), { addSuffix: true })
                  : 'Never'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}