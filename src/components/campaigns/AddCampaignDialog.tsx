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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Campaign } from '@/lib/api';
import { toast } from 'sonner';
import { Shuffle } from 'lucide-react';

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  description: z.string().nullable().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface AddCampaignDialogProps {
  open: boolean;
  onClose: () => void;
}

const generateRandomCampaign = (): CampaignFormData => {
  const campaignTypes = ['Email Outreach', 'LinkedIn Campaign', 'Cold Calling', 'Social Media', 'Content Marketing', 'Webinar Series'];
  const targets = ['Tech Startups', 'Enterprise Clients', 'Small Business', 'Healthcare', 'Finance', 'E-commerce'];
  const statuses: Array<'draft' | 'active' | 'paused' | 'completed'> = ['draft', 'active', 'paused'];
  
  const type = campaignTypes[Math.floor(Math.random() * campaignTypes.length)];
  const target = targets[Math.floor(Math.random() * targets.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const name = `${type} - ${target} Q${Math.floor(Math.random() * 4) + 1} 2024`;
  const description = `${type} campaign targeting ${target.toLowerCase()} segment. Focus on demonstrating value proposition and building relationships.`;
  
  return {
    name,
    status,
    description,
  };
};

export function AddCampaignDialog({ open, onClose }: AddCampaignDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      status: 'draft',
      description: null,
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => api.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully');
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to create campaign');
      console.error('Error creating campaign:', error);
    },
  });

  const onSubmit = (data: CampaignFormData) => {
    const campaignData = {
      name: data.name,
      status: data.status,
      description: data.description || null,
    };
    createCampaignMutation.mutate(campaignData);
  };

  const handleRandomGenerate = () => {
    const randomData = generateRandomCampaign();
    Object.entries(randomData).forEach(([key, value]) => {
      form.setValue(key as keyof CampaignFormData, value as any);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Campaign Details</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRandomGenerate}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Generate Random
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Email Outreach - Tech Startups Q1 2024"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.watch('status')} onValueChange={(value) => form.setValue('status', value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Describe the campaign objectives, target audience, and strategy..."
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCampaignMutation.isPending}>
              {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}