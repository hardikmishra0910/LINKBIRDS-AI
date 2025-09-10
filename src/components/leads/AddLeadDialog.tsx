import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, Lead, Campaign } from '@/lib/api';
import { toast } from 'sonner';
import { Shuffle } from 'lucide-react';

const leadSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().nullable().optional(),
  status: z.enum(['pending', 'contacted', 'responded', 'converted']),
  notes: z.string().nullable().optional(),
  last_contact_date: z.string().nullable().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

interface AddLeadDialogProps {
  open: boolean;
  onClose: () => void;
}

const generateRandomLead = (campaigns: Campaign[]): LeadFormData => {
  const names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Chen', 'David Wilson', 'Lisa Brown', 'Alex Taylor', 'Maria Garcia'];
  const companies = ['TechCorp Inc', 'Global Solutions', 'InnovateLab', 'DataStream LLC', 'CloudFirst', 'NextGen Systems', 'SmartTech', 'FutureWorks'];
  const domains = ['gmail.com', 'outlook.com', 'company.com', 'business.net', 'enterprise.co'];
  const statuses: Array<'pending' | 'contacted' | 'responded' | 'converted'> = ['pending', 'contacted', 'responded', 'converted'];
  
  const name = names[Math.floor(Math.random() * names.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${name.toLowerCase().replace(' ', '.')}@${domain}`;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    campaign_id: campaigns.length > 0 ? campaigns[Math.floor(Math.random() * campaigns.length)].id : '',
    name,
    email,
    company,
    status,
    notes: `Generated lead for ${company}. Interested in our services.`,
    last_contact_date: null,
  };
};

export function AddLeadDialog({ open, onClose }: AddLeadDialogProps) {
  const queryClient = useQueryClient();
  
  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.getCampaigns(),
  });

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      campaign_id: '',
      name: '',
      email: '',
      company: null,
      status: 'pending',
      notes: null,
      last_contact_date: null,
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => api.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to create lead');
      console.error('Error creating lead:', error);
    },
  });

  const onSubmit = (data: LeadFormData) => {
    const leadData = {
      campaign_id: data.campaign_id,
      name: data.name,
      email: data.email,
      company: data.company || null,
      status: data.status,
      notes: data.notes || null,
      last_contact_date: data.last_contact_date || null,
    };
    createLeadMutation.mutate(leadData);
  };

  const handleRandomGenerate = () => {
    if (campaigns && campaigns.length > 0) {
      const randomData = generateRandomLead(campaigns);
      Object.entries(randomData).forEach(([key, value]) => {
        form.setValue(key as keyof LeadFormData, value as any);
      });
    } else {
      toast.error('Please create a campaign first');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Lead Information</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomGenerate}
              disabled={!campaigns || campaigns.length === 0}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Generate Random
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="John Doe"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="john@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                {...form.register('company')}
                placeholder="Company Name"
              />
            </div>

            <div className="space-y-2">
              <Label>Campaign *</Label>
              <Select value={form.watch('campaign_id')} onValueChange={(value) => form.setValue('campaign_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.campaign_id && (
                <p className="text-sm text-destructive">{form.formState.errors.campaign_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="responded">Responded</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...form.register('notes')}
              placeholder="Additional notes about this lead..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLeadMutation.isPending}>
              {createLeadMutation.isPending ? 'Creating...' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}